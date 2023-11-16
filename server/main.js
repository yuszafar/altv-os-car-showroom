import * as alt from "alt-server";
import * as data from "./data.js"

alt.onClient("vehicleShop:active", vehicleShopActive)
alt.onClient("vehicleShop:buyVehicle", buyVehicle)

alt.on("playerConnect", (player) => {
    player.model = "MP_M_Freemode_01"
    player.pos = new alt.Vector3(-55.7971, -1112.2330, 25.4358);
    vehicleShopInit(player)
})
export async function vehicleShopInit(player) {
    data.SHOP_MARKERS.forEach((shop) => {
        alt.emitClient(player, "client::marker:create", shop.marker_position, "vehicleShop", {id: shop.id});
    });
}

async function vehicleShopActive(player, shopId) {
    const shop = data.SHOP_MARKERS.find(shop => shop.id === shopId)
    alt.emitClient(player, "client::vehicleCamera:create", shop.cars);
}

async function buyVehicle(player, shopId, carId, color1, color2) {

    const shop = data.SHOP_MARKERS.find(shop => shop.id === shopId)
    const car = shop.cars.find(car => car.id === carId)

    /*
        If Player don't have enough money
        alt.emitClient(player, 'client::vehicleShop:buyError')

     */

    const veh = new alt.Vehicle(car.name,
        shop.car_spawn_pos.x,
        shop.car_spawn_pos.y,
        shop.car_spawn_pos.z,
        0, 0, 0);

    veh.primaryColor = color1;
    veh.secondaryColor = color2;

    player.setIntoVehicle(veh, 1);

    alt.emitClient(player, "client::vehicleShop:bought");

}

