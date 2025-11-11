SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'd1cbb573-b265-4ab7-8eb8-be0c11c2c132', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"agent@ddd.com","user_id":"7667d6b7-b840-43e1-8abb-3a9e6e711c71","user_phone":""}}', '2025-11-11 04:41:49.143516+00', ''),
	('00000000-0000-0000-0000-000000000000', '913005cf-6895-492f-9d38-2c1558e166ea', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"boss@ddd.com","user_id":"8ab19db6-9e49-4fcb-b358-8956f113f6f4","user_phone":""}}', '2025-11-11 04:42:02.20293+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fde3bbe5-a7ad-4a09-9c86-5237712cc3ca', '{"action":"login","actor_id":"8ab19db6-9e49-4fcb-b358-8956f113f6f4","actor_username":"boss@ddd.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-11 04:42:35.760254+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed4b1dbc-2f93-4126-92e4-492d1d2fefd0', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"agent@ddd.com","user_id":"7667d6b7-b840-43e1-8abb-3a9e6e711c71","user_phone":""}}', '2025-11-11 04:43:11.123671+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a409a0c-d143-46f2-bec3-14de723ff324', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"agent@ddd.com","user_id":"a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033","user_phone":""}}', '2025-11-11 04:43:23.972992+00', ''),
	('00000000-0000-0000-0000-000000000000', '15f0561b-d548-43d3-9443-6525b8bdc721', '{"action":"login","actor_id":"a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033","actor_username":"agent@ddd.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-11 04:43:42.069029+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', 'authenticated', 'authenticated', 'boss@ddd.com', '$2a$10$anpFww2yIX.CTwCsupIHy.m210X8EFkagBOaWcSoO1Nrxulbwc.k6', '2025-11-11 04:42:02.203683+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-11 04:42:35.761244+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-11 04:42:02.200257+00', '2025-11-11 04:42:35.769791+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', 'authenticated', 'authenticated', 'agent@ddd.com', '$2a$10$rCM.Lb2g3CKQh02L4dFNC.qroyqcMjjyEZkHvXQ/cYcSFx9UmDxnK', '2025-11-11 04:43:23.9744+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-11 04:43:42.069801+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-11 04:43:23.960113+00', '2025-11-11 04:43:42.071292+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8ab19db6-9e49-4fcb-b358-8956f113f6f4', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', '{"sub": "8ab19db6-9e49-4fcb-b358-8956f113f6f4", "email": "boss@ddd.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-11 04:42:02.201743+00', '2025-11-11 04:42:02.201769+00', '2025-11-11 04:42:02.201769+00', 'aa205077-ab43-4372-bcd1-31fd6c456dba'),
	('a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', '{"sub": "a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033", "email": "agent@ddd.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-11 04:43:23.971881+00', '2025-11-11 04:43:23.971936+00', '2025-11-11 04:43:23.971936+00', 'ed029d56-aba1-4594-96ce-1afc5840f556');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('900eb440-6dff-437a-a730-cfd32e4e4d73', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', '2025-11-11 04:42:35.761579+00', '2025-11-11 04:42:35.761579+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '140.82.113.5', NULL, NULL),
	('deac0ff7-1ba9-41ba-894e-0838a04ab2a5', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', '2025-11-11 04:43:42.069866+00', '2025-11-11 04:43:42.069866+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '140.82.113.5', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('900eb440-6dff-437a-a730-cfd32e4e4d73', '2025-11-11 04:42:35.771793+00', '2025-11-11 04:42:35.771793+00', 'password', '893cc68c-0fc3-4bb2-bfbb-f51fc427644f'),
	('deac0ff7-1ba9-41ba-894e-0838a04ab2a5', '2025-11-11 04:43:42.071488+00', '2025-11-11 04:43:42.071488+00', 'password', 'a08d00b3-73f3-4626-98b6-635ee49ae43b');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'gp6m5i6i55va', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', false, '2025-11-11 04:42:35.764404+00', '2025-11-11 04:42:35.764404+00', NULL, '900eb440-6dff-437a-a730-cfd32e4e4d73'),
	('00000000-0000-0000-0000-000000000000', 2, 'cmh47gzw3nzb', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', false, '2025-11-11 04:43:42.070584+00', '2025-11-11 04:43:42.070584+00', NULL, 'deac0ff7-1ba9-41ba-894e-0838a04ab2a5');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "name", "email", "role", "avatar_url", "paw_points", "created_at", "updated_at", "photo_url", "phone", "address", "bio") VALUES
	('8ab19db6-9e49-4fcb-b358-8956f113f6f4', 'BOSSS!!!', 'boss@ddd.com', 'fur_boss', NULL, 0, '2025-11-11 04:42:02.19991+00', '2025-11-11 04:45:52.346868+00', NULL, NULL, NULL, NULL),
	('a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', 'AGENTLEZZZZ', 'agent@ddd.com', 'fur_agent', NULL, 20, '2025-11-11 04:43:23.959788+00', '2025-11-11 04:46:07.425189+00', NULL, NULL, NULL, NULL);


--
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."pets" ("id", "fur_boss_id", "name", "breed", "age", "photo_url", "medical_info", "vet_contact", "food_preferences", "created_at", "updated_at", "pet_type") VALUES
	('f52ab396-a9d7-4c9d-9154-2e336164bd78', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', 'Zach', 'Cockapoo', 9, NULL, 'NA', 'Doc', 'Kibbb', '2025-11-11 04:44:14.681996+00', '2025-11-11 04:44:14.681996+00', 'dog'),
	('38cb79e0-cf80-4882-8337-7e00c0603940', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', 'Zica', 'Betta', 3, NULL, NULL, NULL, 'Feed', '2025-11-11 04:44:31.753898+00', '2025-11-11 04:44:31.753898+00', 'fish');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sessions" ("id", "fur_boss_id", "pet_id", "start_date", "end_date", "recurrence_rule", "status", "notes", "created_at", "updated_at") VALUES
	('abcad3cf-1df2-4bbb-99aa-cce45648705f', '8ab19db6-9e49-4fcb-b358-8956f113f6f4', 'f52ab396-a9d7-4c9d-9154-2e336164bd78', '2025-11-08', '2025-11-15', NULL, 'active', NULL, '2025-11-11 04:45:07.948192+00', '2025-11-11 04:45:07.948192+00');


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activities" ("id", "session_id", "pet_id", "activity_type", "time_period", "date", "caretaker_id", "photo_url", "notes", "created_at") VALUES
	('123cceb2-4b83-466f-80f4-cc6e157969ec', 'abcad3cf-1df2-4bbb-99aa-cce45648705f', 'f52ab396-a9d7-4c9d-9154-2e336164bd78', 'feed', 'morning', '2025-11-11', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', NULL, NULL, '2025-11-11 04:45:17.938827+00'),
	('568acfe7-1014-44e6-9b22-f128ee4a71d0', 'abcad3cf-1df2-4bbb-99aa-cce45648705f', 'f52ab396-a9d7-4c9d-9154-2e336164bd78', 'feed', 'evening', '2025-11-11', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', NULL, NULL, '2025-11-11 04:45:20.466169+00');


--
-- Data for Name: care_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: care_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pet_care_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."schedules" ("id", "pet_id", "session_id", "feeding_instruction", "walking_instruction", "letout_instruction", "created_at", "updated_at") VALUES
	('67d0394c-ac47-493f-a0f8-c4f6e1302133', 'f52ab396-a9d7-4c9d-9154-2e336164bd78', NULL, 'Give 1/2 cup food and fresh water', 'Walk around the block for 15-20 minutes', 'Let out in backyard for 5-10 minutes', '2025-11-11 04:44:55.739294+00', '2025-11-11 04:44:55.739294+00');


--
-- Data for Name: schedule_times; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."schedule_times" ("id", "schedule_id", "activity_type", "time_period", "created_at") VALUES
	('abc629ea-6713-4298-a62d-edcb2dc237f5', '67d0394c-ac47-493f-a0f8-c4f6e1302133', 'feed', 'morning', '2025-11-11 04:44:55.788977+00'),
	('b1a96464-2dd3-4af7-9e5a-77775324c3a0', '67d0394c-ac47-493f-a0f8-c4f6e1302133', 'feed', 'evening', '2025-11-11 04:44:55.788977+00'),
	('ea6b8edd-3835-4f7c-9a06-4255b75bb3ba', '67d0394c-ac47-493f-a0f8-c4f6e1302133', 'walk', 'evening', '2025-11-11 04:44:55.788977+00'),
	('62add618-42f8-471e-9e4a-b3a1de72494d', '67d0394c-ac47-493f-a0f8-c4f6e1302133', 'letout', 'morning', '2025-11-11 04:44:55.788977+00'),
	('c715c309-6499-416d-8a04-4d642b2a426c', '67d0394c-ac47-493f-a0f8-c4f6e1302133', 'letout', 'evening', '2025-11-11 04:44:55.788977+00');


--
-- Data for Name: session_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."session_agents" ("id", "session_id", "fur_agent_id", "created_at") VALUES
	('ba92a13f-aeb0-44e5-92cf-654ed42383fe', 'abcad3cf-1df2-4bbb-99aa-cce45648705f', 'a0c1fe0a-e0bc-49a7-909f-fd8fa3b78033', '2025-11-11 04:45:07.962011+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('activity-photos', 'activity-photos', NULL, '2025-11-11 04:40:08.246632+00', '2025-11-11 04:40:08.246632+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('pet-photos', 'pet-photos', NULL, '2025-11-11 04:40:08.249453+00', '2025-11-11 04:40:08.249453+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('profile-photos', 'profile-photos', NULL, '2025-11-11 04:40:08.253054+00', '2025-11-11 04:40:08.253054+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 2, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
