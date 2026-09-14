CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`size` text NOT NULL,
	`color` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`governorate` text NOT NULL,
	`notes` text NOT NULL,
	`shipping` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `orders_created` ON `orders` (`created`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL,
	`active` integer NOT NULL,
	`demo` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER reserve_stock BEFORE INSERT ON order_items BEGIN
 SELECT CASE WHEN NEW.quantity < 1 OR NOT EXISTS (SELECT 1 FROM products WHERE id=NEW.product_id AND active=1 AND demo=0 AND stock >= NEW.quantity AND price=NEW.price AND EXISTS (SELECT 1 FROM json_each(products.data, '$.sizes') WHERE value=NEW.size) AND EXISTS (SELECT 1 FROM json_each(products.data, '$.colors') WHERE value=NEW.color)) THEN RAISE(ABORT, 'OUT_OF_STOCK') END;
 UPDATE products SET stock=stock-NEW.quantity,updated=updated+1 WHERE id=NEW.product_id;
END;
--> statement-breakpoint
CREATE TRIGGER restore_cancelled_stock AFTER UPDATE OF status ON orders WHEN NEW.status='cancelled' AND OLD.status!='cancelled' BEGIN
 UPDATE products SET stock=stock+COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id=NEW.id AND product_id=products.id),0),updated=updated+1 WHERE id IN (SELECT product_id FROM order_items WHERE order_id=NEW.id);
END;
