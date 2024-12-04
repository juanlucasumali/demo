
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

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.users (user_id, email)
        VALUES (NEW.id, NEW.email);
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.users
        SET email = NEW.email
        WHERE user_id = NEW.id;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.users
        WHERE user_id = OLD.id;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."file_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "file_id" "uuid",
    "shared_by" "uuid",
    "shared_with" "uuid",
    "permission_level" "text",
    CONSTRAINT "valid_permission_levels" CHECK (("permission_level" = ANY (ARRAY['viewer'::"text", 'commenter'::"text", 'editor'::"text"])))
);

ALTER TABLE "public"."file_shares" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "filename" "text",
    "file_path" "text",
    "format" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "size" bigint,
    "status" "text"
);

ALTER TABLE "public"."files" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text",
    "display_name" "text",
    "email" "text"
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."file_shares"
    ADD CONSTRAINT "file_shares_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."file_shares"
    ADD CONSTRAINT "file_shares_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."file_shares"
    ADD CONSTRAINT "file_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."file_shares"
    ADD CONSTRAINT "file_shares_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."files"
    ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."files" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."files" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."files" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."files" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON "public"."files" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable update for users based on user_id" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."file_shares" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."files" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."file_shares" TO "anon";
GRANT ALL ON TABLE "public"."file_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."file_shares" TO "service_role";

GRANT ALL ON TABLE "public"."files" TO "anon";
GRANT ALL ON TABLE "public"."files" TO "authenticated";
GRANT ALL ON TABLE "public"."files" TO "service_role";

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

--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT OR DELETE OR UPDATE ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
