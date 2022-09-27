DROP TABLE IF EXISTS "public"."photo";

CREATE TABLE IF NOT EXISTS "public"."photo" (
	id serial NOT NULL,
	file_name varchar NOT NULL DEFAULT 'Unk',
	objectid varchar NOT NULL DEFAULT 'Unk',
	photo_class varchar NOT NULL DEFAULT 'Unk',
	file_md5 CHAR(32) NOT NULL DEFAULT 'Unk',
	creator int not null DEFAULT 0,
	create_time timestamp NOT NULL DEFAULT NOW(),
	operator int not null DEFAULT 0,
	operat_time timestamp NOT NULL DEFAULT NOW(),
	is_delete bool NOT NULL DEFAULT False,
	CONSTRAINT public_photo_pk PRIMARY KEY (id),
	CONSTRAINT "uk_file_md5" UNIQUE ("file_md5")
);
COMMENT ON TABLE "public"."photo" IS '客户图片表';
CREATE TRIGGER "public_photo_operat_time" BEFORE UPDATE ON "public"."photo" FOR EACH ROW EXECUTE PROCEDURE operat_time();
-- Column comments
COMMENT ON COLUMN "public"."photo".file_name IS '文件名称';
COMMENT ON COLUMN "public"."photo".file_md5 IS '文件MD5';
COMMENT ON COLUMN "public"."photo".objectid IS '文件路径';
COMMENT ON COLUMN "public"."photo".photo_class IS '文件分类';