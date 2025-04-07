

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "stripe";


ALTER SCHEMA "stripe" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_email_exists"("email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return exists (
    select 1 
    from auth.users 
    where auth.users.email = check_email_exists.email
  );
end;
$$;


ALTER FUNCTION "public"."check_email_exists"("email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer"("p_user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_customer json;
begin
  select 
    json_build_object(
      'id', c.id,
      'email', c.email,
      'name', c.name,
      'metadata', c.metadata,
      'created_at', c.created_at,
      'updated_at', c.updated_at
    ) into v_customer
  from stripe.customers c
  where c.metadata->>'supabase_user_id' = p_user_id::text
  limit 1;

  return v_customer;
end;
$$;


ALTER FUNCTION "public"."get_customer"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_match"("p_user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return (
    select attrs->'id'
    from stripe.customers c
    where c.attrs->'metadata'->>'supabase_user_id' = p_user_id::text
    limit 1
  );
end;
$$;


ALTER FUNCTION "public"."get_customer_match"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_filtered_files"("p_user_id" "uuid", "p_parent_folder_id" "uuid" DEFAULT NULL::"uuid", "p_project_id" "uuid" DEFAULT NULL::"uuid", "p_collection_id" "uuid" DEFAULT NULL::"uuid", "p_include_nested" boolean DEFAULT false, "p_search_term" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "owner_id" "uuid", "type" "text", "name" "text", "description" "text", "icon_url" "text", "tags" "text", "format" "text", "size" bigint, "duration" integer, "file_path" "text", "created_at" timestamp with time zone, "last_modified" timestamp with time zone, "last_opened" timestamp with time zone, "owner_data" "jsonb", "shared_with" "jsonb", "is_starred" boolean, "file_projects" "uuid"[], "file_collections" "uuid"[], "file_folders" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_filtered_files"("p_user_id" "uuid", "p_parent_folder_id" "uuid", "p_project_id" "uuid", "p_collection_id" "uuid", "p_include_nested" boolean, "p_search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription"("customer_id" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return (
    select attrs->'plan'->'id'
    from stripe.subscriptions s
    where s.customer = customer_id
    limit 1
  );
end;
$$;


ALTER FUNCTION "public"."get_subscription"("customer_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription_status"("customer_id" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return (
    select 'id', 'attrs'
    from stripe.subscriptions s
    where s.customer = customer_id
    limit 1
  );
end;
$$;


ALTER FUNCTION "public"."get_subscription_status"("customer_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_existing_relationships"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Migrate project relationships
    INSERT INTO file_projects (file_id, project_id)
    SELECT id, project_id 
    FROM files 
    WHERE project_id IS NOT NULL
    ON CONFLICT DO NOTHING;

    -- Migrate collection relationships
    INSERT INTO file_collections (file_id, collection_id)
    SELECT id, collection_id 
    FROM files 
    WHERE collection_id IS NOT NULL
    ON CONFLICT DO NOTHING;

    -- Migrate folder relationships
    INSERT INTO file_folders (file_id, folder_id)
    SELECT id, parent_folder_id 
    FROM files 
    WHERE parent_folder_id IS NOT NULL
    ON CONFLICT DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."migrate_existing_relationships"() OWNER TO "postgres";


CREATE FOREIGN DATA WRAPPER "stripe_wrapper" HANDLER "extensions"."stripe_fdw_handler" VALIDATOR "extensions"."stripe_fdw_validator";




CREATE SERVER "stripe_server" FOREIGN DATA WRAPPER "stripe_wrapper" OPTIONS (
    "api_key_id" '6579e683-02ff-4512-9dbb-a5219e19150f',
    "api_key_name" 'stripe',
    "api_url" 'https://api.stripe.com/v1/',
    "api_version" '2024-06-20'
);


ALTER SERVER "stripe_server" OWNER TO "postgres";


CREATE SERVER "stripe_wrapper_server" FOREIGN DATA WRAPPER "stripe_wrapper" OPTIONS (
    "api_key_id" '57596e7d-13b9-426b-a0b1-675ad9727b1a',
    "api_url" 'https://api.stripe.com/v1/'
);


ALTER SERVER "stripe_wrapper_server" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "movie" "text",
    "song" "text",
    "place" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_collections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "file_id" "uuid" NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."file_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_folders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "file_id" "uuid" NOT NULL,
    "folder_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "primary_parent" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."file_folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "file_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."file_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_sync_states" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sync_config_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "local_modified_at" timestamp with time zone NOT NULL,
    "remote_modified_at" timestamp with time zone NOT NULL,
    "last_synced_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."file_sync_states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "tags" "text",
    "format" "text",
    "size" bigint,
    "duration" integer,
    "file_path" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_opened" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "files_type_check" CHECK (("type" = ANY (ARRAY['file'::"text", 'folder'::"text"])))
);


ALTER TABLE "public"."files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."highlights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "position" smallint NOT NULL,
    CONSTRAINT "highlights_position_check" CHECK ((("position" >= 0) AND ("position" <= 2)))
);


ALTER TABLE "public"."highlights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "from_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "to_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "request_type" "text",
    "request_description" "text",
    "shared_item_id" "uuid",
    "shared_project_id" "uuid" DEFAULT "gen_random_uuid"(),
    "shared_message" "text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_modified" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "last_opened" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shared_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "file_id" "uuid",
    "project_id" "uuid",
    "shared_with_id" "uuid" NOT NULL,
    "shared_by_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "shared_items_one_id_not_null" CHECK (((("file_id" IS NOT NULL) AND ("project_id" IS NULL)) OR (("project_id" IS NOT NULL) AND ("file_id" IS NULL))))
);


ALTER TABLE "public"."shared_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."starred_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_id" "uuid",
    "project_id" "uuid",
    CONSTRAINT "starred_items_one_id_not_null" CHECK (((("file_id" IS NOT NULL) AND ("project_id" IS NULL)) OR (("project_id" IS NOT NULL) AND ("file_id" IS NULL))))
);


ALTER TABLE "public"."starred_items" OWNER TO "postgres";


CREATE FOREIGN TABLE "stripe"."customers" (
    "id" "text",
    "email" "text",
    "name" "text",
    "description" "text",
    "created" timestamp without time zone,
    "attrs" "jsonb"
)
SERVER "stripe_wrapper_server"
OPTIONS (
    "id" '442780',
    "object" 'customers',
    "rowid_column" 'id',
    "schema" 'stripe'
);


ALTER FOREIGN TABLE "stripe"."customers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stripe_customers" AS
 SELECT "customers"."id",
    "customers"."email",
    "customers"."name",
    "customers"."description",
    "customers"."created",
    "customers"."attrs"
   FROM "stripe"."customers";


ALTER TABLE "public"."stripe_customers" OWNER TO "postgres";


CREATE FOREIGN TABLE "stripe"."products" (
    "id" "text",
    "name" "text",
    "active" boolean,
    "default_price" "text",
    "description" "text",
    "created" timestamp without time zone,
    "updated" timestamp without time zone,
    "attrs" "jsonb"
)
SERVER "stripe_wrapper_server"
OPTIONS (
    "id" '442777',
    "object" 'products',
    "rowid_column" 'id',
    "schema" 'stripe'
);


ALTER FOREIGN TABLE "stripe"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stripe_products" AS
 SELECT "products"."id",
    "products"."name",
    "products"."active",
    "products"."default_price",
    "products"."description",
    "products"."created",
    "products"."updated",
    "products"."attrs"
   FROM "stripe"."products";


ALTER TABLE "public"."stripe_products" OWNER TO "postgres";


CREATE FOREIGN TABLE "stripe"."subscriptions" (
    "id" "text",
    "customer" "text",
    "currency" "text",
    "current_period_start" timestamp without time zone,
    "current_period_end" timestamp without time zone,
    "attrs" "jsonb"
)
SERVER "stripe_wrapper_server"
OPTIONS (
    "id" '442774',
    "object" 'subscriptions',
    "rowid_column" 'id',
    "schema" 'stripe'
);


ALTER FOREIGN TABLE "stripe"."subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stripe_subscriptions" AS
 SELECT "subscriptions"."id",
    "subscriptions"."customer",
    "subscriptions"."currency",
    "subscriptions"."current_period_start",
    "subscriptions"."current_period_end",
    "subscriptions"."attrs"
   FROM "stripe"."subscriptions";


ALTER TABLE "public"."stripe_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_configurations" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "local_path" "text" NOT NULL,
    "remote_folder_id" "uuid",
    "last_synced_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text"
);


ALTER TABLE "public"."sync_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams_contact_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company" "text" NOT NULL,
    "team_size" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT '''pending'''::"text" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."teams_contact_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "name" "text",
    "avatar" "text",
    "description" "text",
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."file_collections"
    ADD CONSTRAINT "file_collections_file_id_collection_id_key" UNIQUE ("file_id", "collection_id");



ALTER TABLE ONLY "public"."file_collections"
    ADD CONSTRAINT "file_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_folders"
    ADD CONSTRAINT "file_folders_file_id_folder_id_key" UNIQUE ("file_id", "folder_id");



ALTER TABLE ONLY "public"."file_folders"
    ADD CONSTRAINT "file_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_projects"
    ADD CONSTRAINT "file_projects_file_id_project_id_key" UNIQUE ("file_id", "project_id");



ALTER TABLE ONLY "public"."file_projects"
    ADD CONSTRAINT "file_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_sync_states"
    ADD CONSTRAINT "file_sync_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."file_sync_states"
    ADD CONSTRAINT "file_sync_states_sync_config_id_file_path_key" UNIQUE ("sync_config_id", "file_path");



ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_user_id_position_key" UNIQUE ("user_id", "position");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_unique_file_share" UNIQUE ("file_id", "shared_with_id");



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_unique_project_share" UNIQUE ("project_id", "shared_with_id");



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_unique_file" UNIQUE ("user_id", "file_id");



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_unique_project" UNIQUE ("user_id", "project_id");



ALTER TABLE ONLY "public"."sync_configurations"
    ADD CONSTRAINT "sync_configurations_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."sync_configurations"
    ADD CONSTRAINT "sync_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams_contact_requests"
    ADD CONSTRAINT "teams_contact_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_file_collections_collection_id" ON "public"."file_collections" USING "btree" ("collection_id");



CREATE INDEX "idx_file_collections_file_id" ON "public"."file_collections" USING "btree" ("file_id");



CREATE INDEX "idx_file_folders_file_id" ON "public"."file_folders" USING "btree" ("file_id");



CREATE INDEX "idx_file_folders_folder_id" ON "public"."file_folders" USING "btree" ("folder_id");



CREATE INDEX "idx_file_projects_file_id" ON "public"."file_projects" USING "btree" ("file_id");



CREATE INDEX "idx_file_projects_project_id" ON "public"."file_projects" USING "btree" ("project_id");



CREATE INDEX "idx_starred_items_file_id" ON "public"."starred_items" USING "btree" ("file_id");



CREATE INDEX "idx_starred_items_project_id" ON "public"."starred_items" USING "btree" ("project_id");



CREATE INDEX "idx_starred_items_user_id" ON "public"."starred_items" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_collections"
    ADD CONSTRAINT "file_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_collections"
    ADD CONSTRAINT "file_collections_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_folders"
    ADD CONSTRAINT "file_folders_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_folders"
    ADD CONSTRAINT "file_folders_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_projects"
    ADD CONSTRAINT "file_projects_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_projects"
    ADD CONSTRAINT "file_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."file_sync_states"
    ADD CONSTRAINT "file_sync_states_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "public"."sync_configurations"("id");



ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."highlights"
    ADD CONSTRAINT "highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_shared_item_id_fkey" FOREIGN KEY ("shared_item_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_shared_project_id_fkey" FOREIGN KEY ("shared_project_id") REFERENCES "public"."projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_shared_by_id_fkey" FOREIGN KEY ("shared_by_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_items"
    ADD CONSTRAINT "shared_items_shared_with_id_fkey" FOREIGN KEY ("shared_with_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."starred_items"
    ADD CONSTRAINT "starred_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_configurations"
    ADD CONSTRAINT "sync_configurations_remote_folder_id_fkey" FOREIGN KEY ("remote_folder_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_configurations"
    ADD CONSTRAINT "sync_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams_contact_requests"
    ADD CONSTRAINT "teams_contact_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable insert for users based on user_id" ON "public"."users" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "No manual deletion" ON "public"."users" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own highlights" ON "public"."highlights" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own highlights" ON "public"."highlights" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own favorites" ON "public"."favorites" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own highlights" ON "public"."highlights" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all profiles" ON "public"."users" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own highlights" ON "public"."highlights" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "stripe" TO "authenticated";









































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_email_exists"("email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_match"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_match"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_match"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_filtered_files"("p_user_id" "uuid", "p_parent_folder_id" "uuid", "p_project_id" "uuid", "p_collection_id" "uuid", "p_include_nested" boolean, "p_search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_filtered_files"("p_user_id" "uuid", "p_parent_folder_id" "uuid", "p_project_id" "uuid", "p_collection_id" "uuid", "p_include_nested" boolean, "p_search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_filtered_files"("p_user_id" "uuid", "p_parent_folder_id" "uuid", "p_project_id" "uuid", "p_collection_id" "uuid", "p_include_nested" boolean, "p_search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription"("customer_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription"("customer_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription"("customer_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_status"("customer_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_status"("customer_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_status"("customer_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_existing_relationships"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_existing_relationships"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_existing_relationships"() TO "service_role";









SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;












GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."file_collections" TO "anon";
GRANT ALL ON TABLE "public"."file_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."file_collections" TO "service_role";



GRANT ALL ON TABLE "public"."file_folders" TO "anon";
GRANT ALL ON TABLE "public"."file_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."file_folders" TO "service_role";



GRANT ALL ON TABLE "public"."file_projects" TO "anon";
GRANT ALL ON TABLE "public"."file_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."file_projects" TO "service_role";



GRANT ALL ON TABLE "public"."file_sync_states" TO "anon";
GRANT ALL ON TABLE "public"."file_sync_states" TO "authenticated";
GRANT ALL ON TABLE "public"."file_sync_states" TO "service_role";



GRANT ALL ON TABLE "public"."files" TO "anon";
GRANT ALL ON TABLE "public"."files" TO "authenticated";
GRANT ALL ON TABLE "public"."files" TO "service_role";



GRANT ALL ON TABLE "public"."highlights" TO "anon";
GRANT ALL ON TABLE "public"."highlights" TO "authenticated";
GRANT ALL ON TABLE "public"."highlights" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."shared_items" TO "anon";
GRANT ALL ON TABLE "public"."shared_items" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_items" TO "service_role";



GRANT ALL ON TABLE "public"."starred_items" TO "anon";
GRANT ALL ON TABLE "public"."starred_items" TO "authenticated";
GRANT ALL ON TABLE "public"."starred_items" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_customers" TO "anon";
GRANT ALL ON TABLE "public"."stripe_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_customers" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_products" TO "anon";
GRANT ALL ON TABLE "public"."stripe_products" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_products" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."sync_configurations" TO "anon";
GRANT ALL ON TABLE "public"."sync_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."teams_contact_requests" TO "anon";
GRANT ALL ON TABLE "public"."teams_contact_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."teams_contact_requests" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
