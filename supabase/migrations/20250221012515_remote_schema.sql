drop function if exists "public"."get_filtered_files"(p_user_id uuid, p_parent_folder_id uuid, p_project_id uuid, p_collection_id uuid, p_include_nested boolean);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_filtered_files(
  p_user_id uuid, 
  p_parent_folder_id uuid DEFAULT NULL::uuid, 
  p_project_id uuid DEFAULT NULL::uuid, 
  p_collection_id uuid DEFAULT NULL::uuid, 
  p_include_nested boolean DEFAULT false,
  p_search_term text DEFAULT NULL
) RETURNS TABLE(id uuid, owner_id uuid, type text, name text, description text, icon_url text, tags text, format text, size bigint, duration integer, file_path text, created_at timestamp with time zone, last_modified timestamp with time zone, last_opened timestamp with time zone, owner_data jsonb, shared_with jsonb, is_starred boolean, file_projects uuid[], file_collections uuid[], file_folders uuid[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  nested_folder_ids UUID[];
BEGIN
  -- Get nested folder IDs if needed
  IF p_include_nested AND p_parent_folder_id IS NOT NULL THEN
    WITH RECURSIVE folder_hierarchy AS (
      SELECT files.id 
      FROM files 
      WHERE files.id IN (
        SELECT file_id 
        FROM file_folders 
        WHERE folder_id = p_parent_folder_id
      )
      UNION
      SELECT f.id
      FROM files f
      INNER JOIN file_folders ff ON f.id = ff.file_id
      INNER JOIN folder_hierarchy fh ON ff.folder_id = fh.id
    )
    SELECT array_agg(folder_hierarchy.id) INTO nested_folder_ids FROM folder_hierarchy;
  END IF;

  RETURN QUERY
  WITH RECURSIVE folder_hierarchy AS (
    -- Base case: directly shared or owned folders
    SELECT 
      f.id,
      ARRAY[f.id] as path
    FROM files f
    LEFT JOIN shared_items si ON si.file_id = f.id
    WHERE f.type = 'folder' 
    AND (
      f.owner_id = p_user_id 
      OR si.shared_with_id = p_user_id
    )
    
    UNION ALL
    
    -- Recursive case: both parent and child folders
    SELECT 
      CASE
        WHEN ff.folder_id = fh.id THEN ff.file_id
        ELSE ff.folder_id
      END,
      CASE
        WHEN ff.folder_id = fh.id THEN fh.path || ff.file_id
        ELSE fh.path || ff.folder_id
      END
    FROM folder_hierarchy fh
    JOIN file_folders ff ON 
      ff.folder_id = fh.id OR ff.file_id = fh.id
    JOIN files f ON 
      f.id = CASE
        WHEN ff.folder_id = fh.id THEN ff.file_id
        ELSE ff.folder_id
      END
    WHERE f.type = 'folder'
      AND NOT f.id = ANY(fh.path)  -- Prevent cycles
  ),
  accessible_projects AS (
    -- Projects directly owned or shared
    SELECT p.id
    FROM projects p
    LEFT JOIN shared_items si ON si.project_id = p.id
    WHERE p.owner_id = p_user_id 
    OR si.shared_with_id = p_user_id
  ),
  accessible_collections AS (
    -- Collections in accessible projects
    SELECT c.id
    FROM collections c
    INNER JOIN accessible_projects ap ON c.project_id = ap.id
  ),
  filtered_files AS (
    SELECT f.*
    FROM files f
    WHERE 
      -- Enhanced ownership/sharing filter with folder/project/collection inheritance
      (
        f.owner_id = p_user_id 
        OR EXISTS (
          SELECT 1 FROM shared_items si 
          WHERE si.file_id = f.id 
          AND si.shared_with_id = p_user_id
        )
        OR EXISTS (
          SELECT 1 
          FROM folder_hierarchy fh
          INNER JOIN file_folders ff ON ff.folder_id = fh.id
          WHERE ff.file_id = f.id
        )
        OR EXISTS (
          SELECT 1
          FROM accessible_projects ap
          INNER JOIN file_projects fp ON fp.project_id = ap.id
          WHERE fp.file_id = f.id
        )
        OR EXISTS (
          SELECT 1
          FROM accessible_collections ac
          INNER JOIN file_collections fc ON fc.collection_id = ac.id
          WHERE fc.file_id = f.id
        )
      )
      AND
      -- Modified search condition
      CASE 
        WHEN p_search_term IS NOT NULL THEN 
          f.name ILIKE '%' || p_search_term || '%'
        WHEN p_parent_folder_id IS NULL THEN 
          NOT EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id
          )
        WHEN p_include_nested THEN
          f.id = ANY(nested_folder_ids) OR
          EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id 
            AND ff.folder_id = p_parent_folder_id
          )
        ELSE
          EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id 
            AND ff.folder_id = p_parent_folder_id
          )
      END
      AND (
        p_project_id IS NULL OR
        EXISTS (
          SELECT 1 FROM file_projects fp 
          WHERE fp.file_id = f.id 
          AND fp.project_id = p_project_id
        )
      )
      AND (
        p_collection_id IS NULL OR
        EXISTS (
          SELECT 1 FROM file_collections fc 
          WHERE fc.file_id = f.id 
          AND fc.collection_id = p_collection_id
        )
      )
  ),
  folder_access_paths AS (
    -- Get all ancestor folders for each file
    WITH RECURSIVE folder_ancestors AS (
      -- Base case: direct parent folders
      SELECT 
        ff.file_id,
        ff.folder_id,
        ARRAY[ff.folder_id] as path,
        ARRAY[]::uuid[] as shared_users
      FROM file_folders ff
      
      UNION ALL
      
      -- Recursive case: parent folders of parent folders
      SELECT
        fa.file_id,
        ff.folder_id,
        fa.path || ff.folder_id,
        (
          SELECT array_agg(DISTINCT si.shared_with_id)
          FROM shared_items si
          WHERE si.file_id = fa.folder_id
          OR si.file_id = ANY(fa.path)
        ) as shared_users
      FROM folder_ancestors fa
      JOIN file_folders ff ON ff.file_id = fa.folder_id
      WHERE NOT ff.folder_id = ANY(fa.path) -- Prevent cycles
    )
    SELECT DISTINCT ON (file_id, shared_with_id)
      fa.file_id,
      u.id as shared_with_id,
      u.name,
      u.email,
      u.avatar,
      u.username
    FROM folder_ancestors fa
    CROSS JOIN LATERAL unnest(fa.shared_users) as shared_user_id
    JOIN users u ON u.id = shared_user_id
  ),
  all_shared_users AS (
    -- Combine direct file shares and inherited folder shares
    SELECT DISTINCT ON (f.id, u.id)
      f.id as file_id,
      u.id,
      u.name,
      u.email,
      u.avatar,
      u.username,
      'direct' as access_type
    FROM filtered_files f
    JOIN shared_items si ON si.file_id = f.id
    JOIN users u ON u.id = si.shared_with_id
    
    UNION
    
    SELECT DISTINCT ON (f.id, fap.shared_with_id)
      f.id as file_id,
      fap.shared_with_id as id,
      fap.name,
      fap.email,
      fap.avatar,
      fap.username,
      'inherited' as access_type
    FROM filtered_files f
    JOIN folder_access_paths fap ON fap.file_id = f.id
  )
  SELECT 
    f.id,
    f.owner_id,
    f.type,
    f.name,
    f.description,
    f.icon_url,
    f.tags,
    f.format,
    f.size,
    f.duration,
    f.file_path,
    f.created_at,
    f.last_modified,
    f.last_opened,
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'email', u.email,
      'avatar', u.avatar,
      'username', u.username
    ) as owner_data,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', asu.id,
          'name', asu.name,
          'email', asu.email,
          'avatar', asu.avatar,
          'username', asu.username
        )
      ) FILTER (WHERE asu.id IS NOT NULL),
      '[]'::jsonb
    ) as shared_with,
    EXISTS(
      SELECT 1 FROM starred_items si 
      WHERE si.file_id = f.id 
      AND si.user_id = p_user_id
    ) as is_starred,
    ARRAY(
      SELECT fp.project_id FROM file_projects fp WHERE fp.file_id = f.id
    ) as file_projects,
    ARRAY(
      SELECT fc.collection_id FROM file_collections fc WHERE fc.file_id = f.id
    ) as file_collections,
    ARRAY(
      SELECT ff.folder_id FROM file_folders ff WHERE ff.file_id = f.id
    ) as file_folders
  FROM filtered_files f
  INNER JOIN users u ON f.owner_id = u.id
  LEFT JOIN all_shared_users asu ON f.id = asu.file_id
  GROUP BY 
    f.id, f.owner_id, f.type, f.name, f.description, f.icon_url, 
    f.tags, f.format, f.size, f.duration, f.file_path, f.created_at, 
    f.last_modified, f.last_opened,
    u.id, u.name, u.email, u.avatar, u.username;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_filtered_files(p_user_id uuid, p_parent_folder_id uuid DEFAULT NULL::uuid, p_project_id uuid DEFAULT NULL::uuid, p_collection_id uuid DEFAULT NULL::uuid, p_include_nested boolean DEFAULT false)
 RETURNS TABLE(id uuid, owner_id uuid, type text, name text, description text, icon_url text, tags text, format text, size bigint, duration integer, file_path text, created_at timestamp with time zone, last_modified timestamp with time zone, last_opened timestamp with time zone, owner_data jsonb, shared_with jsonb, is_starred boolean, file_projects uuid[], file_collections uuid[], file_folders uuid[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  nested_folder_ids UUID[];
BEGIN
  -- Get nested folder IDs if needed
  IF p_include_nested AND p_parent_folder_id IS NOT NULL THEN
    WITH RECURSIVE folder_hierarchy AS (
      SELECT files.id 
      FROM files 
      WHERE files.id IN (
        SELECT file_id 
        FROM file_folders 
        WHERE folder_id = p_parent_folder_id
      )
      UNION
      SELECT f.id
      FROM files f
      INNER JOIN file_folders ff ON f.id = ff.file_id
      INNER JOIN folder_hierarchy fh ON ff.folder_id = fh.id
    )
    SELECT array_agg(folder_hierarchy.id) INTO nested_folder_ids FROM folder_hierarchy;
  END IF;

  RETURN QUERY
  WITH RECURSIVE folder_hierarchy AS (
    -- Base case: directly shared or owned folders
    SELECT 
      f.id,
      ARRAY[f.id] as path
    FROM files f
    LEFT JOIN shared_items si ON si.file_id = f.id
    WHERE f.type = 'folder' 
    AND (
      f.owner_id = p_user_id 
      OR si.shared_with_id = p_user_id
    )
    
    UNION ALL
    
    -- Recursive case: both parent and child folders
    SELECT 
      CASE
        WHEN ff.folder_id = fh.id THEN ff.file_id
        ELSE ff.folder_id
      END,
      CASE
        WHEN ff.folder_id = fh.id THEN fh.path || ff.file_id
        ELSE fh.path || ff.folder_id
      END
    FROM folder_hierarchy fh
    JOIN file_folders ff ON 
      ff.folder_id = fh.id OR ff.file_id = fh.id
    JOIN files f ON 
      f.id = CASE
        WHEN ff.folder_id = fh.id THEN ff.file_id
        ELSE ff.folder_id
      END
    WHERE f.type = 'folder'
      AND NOT f.id = ANY(fh.path)  -- Prevent cycles
  ),
  accessible_projects AS (
    -- Projects directly owned or shared
    SELECT p.id
    FROM projects p
    LEFT JOIN shared_items si ON si.project_id = p.id
    WHERE p.owner_id = p_user_id 
    OR si.shared_with_id = p_user_id
  ),
  accessible_collections AS (
    -- Collections in accessible projects
    SELECT c.id
    FROM collections c
    INNER JOIN accessible_projects ap ON c.project_id = ap.id
  ),
  filtered_files AS (
    SELECT f.*
    FROM files f
    WHERE 
      -- Enhanced ownership/sharing filter with folder/project/collection inheritance
      (
        f.owner_id = p_user_id 
        OR EXISTS (
          SELECT 1 FROM shared_items si 
          WHERE si.file_id = f.id 
          AND si.shared_with_id = p_user_id
        )
        OR EXISTS (
          SELECT 1 
          FROM folder_hierarchy fh
          INNER JOIN file_folders ff ON ff.folder_id = fh.id
          WHERE ff.file_id = f.id
        )
        OR EXISTS (
          SELECT 1
          FROM accessible_projects ap
          INNER JOIN file_projects fp ON fp.project_id = ap.id
          WHERE fp.file_id = f.id
        )
        OR EXISTS (
          SELECT 1
          FROM accessible_collections ac
          INNER JOIN file_collections fc ON fc.collection_id = ac.id
          WHERE fc.file_id = f.id
        )
      )
      AND
      -- Modified search condition
      CASE 
        WHEN p_parent_folder_id IS NULL THEN 
          NOT EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id
          )
        WHEN p_include_nested THEN
          f.id = ANY(nested_folder_ids) OR
          EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id 
            AND ff.folder_id = p_parent_folder_id
          )
        ELSE
          EXISTS (
            SELECT 1 
            FROM file_folders ff 
            WHERE ff.file_id = f.id 
            AND ff.folder_id = p_parent_folder_id
          )
      END
      AND (
        p_project_id IS NULL OR
        EXISTS (
          SELECT 1 FROM file_projects fp 
          WHERE fp.file_id = f.id 
          AND fp.project_id = p_project_id
        )
      )
      AND (
        p_collection_id IS NULL OR
        EXISTS (
          SELECT 1 FROM file_collections fc 
          WHERE fc.file_id = f.id 
          AND fc.collection_id = p_collection_id
        )
      )
  ),
  folder_access_paths AS (
    -- Get all ancestor folders for each file
    WITH RECURSIVE folder_ancestors AS (
      -- Base case: direct parent folders
      SELECT 
        ff.file_id,
        ff.folder_id,
        ARRAY[ff.folder_id] as path,
        ARRAY[]::uuid[] as shared_users
      FROM file_folders ff
      
      UNION ALL
      
      -- Recursive case: parent folders of parent folders
      SELECT
        fa.file_id,
        ff.folder_id,
        fa.path || ff.folder_id,
        (
          SELECT array_agg(DISTINCT si.shared_with_id)
          FROM shared_items si
          WHERE si.file_id = fa.folder_id
          OR si.file_id = ANY(fa.path)
        ) as shared_users
      FROM folder_ancestors fa
      JOIN file_folders ff ON ff.file_id = fa.folder_id
      WHERE NOT ff.folder_id = ANY(fa.path) -- Prevent cycles
    )
    SELECT DISTINCT ON (file_id, shared_with_id)
      fa.file_id,
      u.id as shared_with_id,
      u.name,
      u.email,
      u.avatar,
      u.username
    FROM folder_ancestors fa
    CROSS JOIN LATERAL unnest(fa.shared_users) as shared_user_id
    JOIN users u ON u.id = shared_user_id
  ),
  all_shared_users AS (
    -- Combine direct file shares and inherited folder shares
    SELECT DISTINCT ON (f.id, u.id)
      f.id as file_id,
      u.id,
      u.name,
      u.email,
      u.avatar,
      u.username,
      'direct' as access_type
    FROM filtered_files f
    JOIN shared_items si ON si.file_id = f.id
    JOIN users u ON u.id = si.shared_with_id
    
    UNION
    
    SELECT DISTINCT ON (f.id, fap.shared_with_id)
      f.id as file_id,
      fap.shared_with_id as id,
      fap.name,
      fap.email,
      fap.avatar,
      fap.username,
      'inherited' as access_type
    FROM filtered_files f
    JOIN folder_access_paths fap ON fap.file_id = f.id
  )
  SELECT 
    f.id,
    f.owner_id,
    f.type,
    f.name,
    f.description,
    f.icon_url,
    f.tags,
    f.format,
    f.size,
    f.duration,
    f.file_path,
    f.created_at,
    f.last_modified,
    f.last_opened,
    jsonb_build_object(
      'id', u.id,
      'name', u.name,
      'email', u.email,
      'avatar', u.avatar,
      'username', u.username
    ) as owner_data,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', asu.id,
          'name', asu.name,
          'email', asu.email,
          'avatar', asu.avatar,
          'username', asu.username
        )
      ) FILTER (WHERE asu.id IS NOT NULL),
      '[]'::jsonb
    ) as shared_with,
    EXISTS(
      SELECT 1 FROM starred_items si 
      WHERE si.file_id = f.id 
      AND si.user_id = p_user_id
    ) as is_starred,
    ARRAY(
      SELECT fp.project_id FROM file_projects fp WHERE fp.file_id = f.id
    ) as file_projects,
    ARRAY(
      SELECT fc.collection_id FROM file_collections fc WHERE fc.file_id = f.id
    ) as file_collections,
    ARRAY(
      SELECT ff.folder_id FROM file_folders ff WHERE ff.file_id = f.id
    ) as file_folders
  FROM filtered_files f
  INNER JOIN users u ON f.owner_id = u.id
  LEFT JOIN all_shared_users asu ON f.id = asu.file_id
  GROUP BY 
    f.id, f.owner_id, f.type, f.name, f.description, f.icon_url, 
    f.tags, f.format, f.size, f.duration, f.file_path, f.created_at, 
    f.last_modified, f.last_opened,
    u.id, u.name, u.email, u.avatar, u.username;
END;
$function$
;


