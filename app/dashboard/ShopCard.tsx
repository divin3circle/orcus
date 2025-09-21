import { MyShop } from "@/hooks/useMyShops";
import React from "react";
import cardRedImage from "@/public/card-red.png";
import cardBlueImage from "@/public/card-blue.png";
import { IconShare } from "@tabler/icons-react";

function ShopCard({ shop }: { shop: MyShop }) {
  const { theme } = shop;
  const cardImage = theme === "red" ? cardRedImage : cardBlueImage;
  return (
    <div
      style={{ backgroundImage: `url(${cardImage.src})` }}
      className="bg-cover bg-center w-full md:w-[315px] h-[200px] px-4 py-3 rounded-3xl flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={shop.profile_image_url}
            alt={shop.name}
            width={36}
            height={36}
            className="rounded-full"
          />
          <h1 className="text-base font-semibold text-background">
            {shop.name}
          </h1>
        </div>
        <IconShare className="text-background cursor-pointer" />
      </div>
      <div className=" flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-base text-background">Balance</h1>
          <h1 className="text-base font-semibold text-background">
            KES 10,000
          </h1>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base text-background">Pay ID</h1>
          <h1 className="text-base font-semibold text-background">
            {shop.payment_id.slice(0, 4)}...{shop.payment_id.slice(-4)}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
