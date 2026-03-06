-- Align legacy product schema/data to the current schema used by this project.
-- Safe to run multiple times.

SET NAMES utf8mb4;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS features JSON NULL,
  ADD COLUMN IF NOT EXISTS specifications JSON NULL,
  ADD COLUMN IF NOT EXISTS images JSON NULL;

DROP PROCEDURE IF EXISTS migrate_products_to_current_schema;
DELIMITER //

CREATE PROCEDURE migrate_products_to_current_schema()
BEGIN
  DECLARE has_product_name INT DEFAULT 0;
  DECLARE has_key_features INT DEFAULT 0;
  DECLARE has_legacy_specifications INT DEFAULT 0;
  DECLARE has_product_images INT DEFAULT 0;

  SELECT COUNT(*) INTO has_product_name
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'product_name';

  SELECT COUNT(*) INTO has_key_features
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'key_features';

  SELECT COUNT(*) INTO has_legacy_specifications
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'specifications';

  SELECT COUNT(*) INTO has_product_images
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_images';

  IF has_product_name > 0 THEN
    SET @sql_copy_name = "
      UPDATE products
      SET name = COALESCE(NULLIF(name, ''), product_name)
      WHERE product_name IS NOT NULL
    ";
    PREPARE stmt_copy_name FROM @sql_copy_name;
    EXECUTE stmt_copy_name;
    DEALLOCATE PREPARE stmt_copy_name;
  END IF;

  IF has_key_features > 0 THEN
    SET @sql_copy_features = "
      UPDATE products
      SET features = CASE
        WHEN features IS NULL AND key_features IS NOT NULL AND TRIM(key_features) <> ''
          THEN JSON_ARRAY(key_features)
        ELSE features
      END
    ";
    PREPARE stmt_copy_features FROM @sql_copy_features;
    EXECUTE stmt_copy_features;
    DEALLOCATE PREPARE stmt_copy_features;
  END IF;

  IF has_legacy_specifications > 0 THEN
    SET @sql_copy_specs = "
      UPDATE products
      SET specifications = CASE
        WHEN specifications IS NULL THEN NULL
        WHEN JSON_VALID(specifications) THEN specifications
        WHEN TRIM(specifications) = '' THEN NULL
        ELSE JSON_ARRAY(specifications)
      END
    ";
    PREPARE stmt_copy_specs FROM @sql_copy_specs;
    EXECUTE stmt_copy_specs;
    DEALLOCATE PREPARE stmt_copy_specs;
  END IF;

  IF has_product_images > 0 THEN
    SET @sql_copy_images = "
      UPDATE products p
      LEFT JOIN (
        SELECT product_id, JSON_ARRAYAGG(image_url) AS image_json
        FROM product_images
        GROUP BY product_id
      ) pi ON pi.product_id = p.id
      SET p.images = COALESCE(p.images, pi.image_json)
      WHERE pi.image_json IS NOT NULL
    ";
    PREPARE stmt_copy_images FROM @sql_copy_images;
    EXECUTE stmt_copy_images;
    DEALLOCATE PREPARE stmt_copy_images;
  END IF;
END //

DELIMITER ;

CALL migrate_products_to_current_schema();
DROP PROCEDURE IF EXISTS migrate_products_to_current_schema;
