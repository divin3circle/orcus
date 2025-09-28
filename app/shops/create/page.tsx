import { ShopForm } from "./shop-form";

export default function CreateShopPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <ShopForm />
      </div>
    </div>
  );
}
