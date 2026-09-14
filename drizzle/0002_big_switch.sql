ALTER TABLE "orders" ADD CONSTRAINT "order_money_valid" CHECK ("orders"."amount">=0 and "orders"."currency"='INR');--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_money_valid" CHECK ("products"."price">=0 and "products"."compare_at_price">="products"."price" and "products"."currency"='INR');--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_sales_gate" CHECK ("products"."sales_enabled"=false);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_mock_count_valid" CHECK ("products"."mock_count">=0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_price_status_valid" CHECK ("products"."price_status" in ('proposed','confirmed'));