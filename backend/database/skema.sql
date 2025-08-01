CREATE DATABASE kafe_db;

CREATE TABLE `kafe_db`.`menus` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` INT(11) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `kafe_db`.`orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `table_number` INT(11) NOT NULL,
  `total_price` INT(11) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
ALTER TABLE `orders`
ADD `customer_name` VARCHAR(255) NOT NULL AFTER `table_number`;

CREATE TABLE `kafe_db`.`order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `menu_id` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `kafe_db`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`username`)
) ENGINE = InnoDB;