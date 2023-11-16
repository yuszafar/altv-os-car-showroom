import * as alt from 'alt';
import * as native from 'natives';

let cameraControlsInterval;
let camera;
let zpos = 0;
let fov = 90;
let startPosition;
let startCamPosition;
let timeBetweenAnimChecks = Date.now() + 100;
let vehicle
let shopId
let isActive = false
let player = alt.Player.local;
let view;
const url = `http://resource/client/html/cars.html`;
alt.requestIpl("shr_int");

alt.onServer('client::vehicleCamera:create', createVehicleChoiceCamera);
alt.onServer('client::vehicleCamera:disable', destroyPedEditCamera);

alt.onServer('client::vehicleShop:buyError', buyError);
alt.onServer('client::vehicleShop:bought', vehicleBought);


alt.onServer('client::marker:create', (pos, type = null, data = {}) => {
    const color = new alt.RGBA(255, 0, 0);
    const marker = new alt.Marker(1, pos, color);
    marker.setMeta("type", type);
    marker.setMeta("data", data);
})


alt.on('keyup', (key) => {
    if (isActive)
        return
    if (key == 69) {
        alt.Marker.all.forEach(value => {
            const dist = native.getDistanceBetweenCoords(value.pos.x, value.pos.y, value.pos.z, player.pos.x, player.pos.y, player.pos.z, false);
            const type = value.getMeta("type");
            if (dist <= 2 && type == "vehicleShop") {
                isActive = true;
                alt.showCursor(true);
                const data = value.getMeta("data");
                shopId = data["id"];
                alt.emitServer("vehicleShop:active", shopId);
            }
        })
    }
})

export function createVehicleChoiceCamera(cars) {
    if (!view) {
        view = new alt.WebView(url);
    }
    view.focus();
    view.emit('setCars', cars)

    view.on("vehicleShop:setModel", (model) => {
        if (vehicle)
            vehicle.model = model;
    });

    view.on("vehicleShop:setColor", (color1, color2) => {
        if (vehicle)
            native.setVehicleColours(vehicle, color1, color2)
    });

    view.on("vehicleShop:buyVehicle", (productId, color1, color2) => {
        alt.emitServer("vehicleShop:buyVehicle", shopId, productId, color1, color2);
    });


    const startPosition = {x: 110.665, y: 6625.531, z: 31.098};

    const vehPos = new alt.Vector3(110.665, 6625.531, 31.098)
    const vehRot = new alt.Vector3(0, 0, 43.86065673828125)
    vehicle = new alt.LocalVehicle(cars[0].name, 0, vehPos, vehRot)
    alt.FocusData.overrideFocus(vehPos)
    if (!camera) {
        const forwardCameraPosition = {
            x: 106.85629272460938, y: 6629.12548828125, z: 32.162845611572266 + 0.3
        };

        fov = 84;
        startCamPosition = forwardCameraPosition;

        camera = native.createCamWithParams(
            'DEFAULT_SCRIPTED_CAMERA',
            forwardCameraPosition.x,
            forwardCameraPosition.y,
            forwardCameraPosition.z,
            0,
            0,
            0,
            fov,
            true,
            0
        );

        native.pointCamAtCoord(camera, startPosition.x, startPosition.y, startPosition.z);
        native.setCamActive(camera, true);
        native.renderScriptCams(true, false, 0, true, false, 0);
    }

    cameraControlsInterval = alt.setInterval(handleControls, 0);
}

export function destroyPedEditCamera() {
    if (cameraControlsInterval !== undefined || cameraControlsInterval !== null) {
        alt.clearInterval(cameraControlsInterval);
        cameraControlsInterval = null;
    }

    if (camera) {
        camera = null;
    }

    native.destroyAllCams(true);
    native.renderScriptCams(false, false, 0, false, false, 0);

    zpos = 0;
    fov = 90;
    startPosition = null;
    startCamPosition = null;
}

function handleControls() {
    native.hideHudAndRadarThisFrame();
    native.disableAllControlActions(0);
    native.disableAllControlActions(1);
    native.disableControlAction(0, 0, true);
    native.disableControlAction(0, 1, true);
    native.disableControlAction(0, 2, true);
    native.disableControlAction(0, 24, true);
    native.disableControlAction(0, 25, true);
    native.disableControlAction(0, 32, true); // w
    native.disableControlAction(0, 33, true); // s
    native.disableControlAction(0, 34, true); // a
    native.disableControlAction(0, 35, true); // d

    native.disableControlAction(0, 245, true); // chat
    native.disableControlAction(0, 202, true); //
    native.disableControlAction(0, 199, true); //
    native.disableControlAction(0, 200, true); //

    const [_, height, width] = native.getActualScreenResolution(0, 0);
    const cursor = alt.getCursorPos();
    const _x = cursor.x;
    let oldHeading = native.getEntityHeading(vehicle.scriptID);


    if (native.isDisabledControlJustReleased(0, 200)) {
        vehicle.destroy();
        isActive = false;
        alt.showCursor(false);
        view.unfocus();
        view.destroy();
        view = undefined;
        alt.FocusData.clearFocus();
        destroyPedEditCamera();
    }

    // Scroll Up
    if (native.isDisabledControlPressed(0, 15)) {
        if (_x > width / 2 - 100) {
            fov -= 2;

            if (fov < 10) {
                fov = 10;
            }

            native.setCamFov(camera, fov);
            native.setCamActive(camera, true);
            native.renderScriptCams(true, false, 0, true, false, 0);
        }
    }

    // SCroll Down
    if (native.isDisabledControlPressed(0, 16)) {
        if (_x > width / 2 - 100) {
            fov += 2;

            if (fov > 130) {
                fov = 130;
            }

            native.setCamFov(camera, fov);
            native.setCamActive(camera, true);
            native.renderScriptCams(true, false, 0, true, false, 0);
        }
    }

    if (native.isDisabledControlPressed(0, 24) && _x > width / 2 - 100) { // ЛКМ

        if (native.getDisabledControlNormal(0, 1) > 0.13) { // Right
            const newHeading = (oldHeading += 2 + 10 * native.getDisabledControlNormal(0, 1));
            native.setEntityHeading(vehicle.scriptID, newHeading);
        }

        if (native.getDisabledControlNormal(0, 1) < -0.13) { // left
            const newHeading = (oldHeading -= 2 - 10 * native.getDisabledControlNormal(0, 1));
            native.setEntityHeading(vehicle.scriptID, newHeading);
        }

        if (native.getDisabledControlNormal(0, 2) > 0.13) {
            zpos += 0.02;

            if (zpos > 1.2) {
                zpos = 1.2;
            }

            native.setCamCoord(camera, startCamPosition.x, startCamPosition.y, startCamPosition.z + zpos);
            native.pointCamAtCoord(camera, startPosition.x, startPosition.y, startPosition.z + zpos);
            native.setCamActive(camera, true);
            native.renderScriptCams(true, false, 0, true, false, 0);
        }

        if (native.getDisabledControlNormal(0, 2) < -0.13) {
            zpos -= 0.02;

            if (zpos < -1.2) {
                zpos = -1.2;
            }

            native.setCamCoord(camera, startCamPosition.x, startCamPosition.y, startCamPosition.z + zpos);
            native.pointCamAtCoord(camera, startPosition.x, startPosition.y, startPosition.z + zpos);
            native.setCamActive(camera, true);
            native.renderScriptCams(true, false, 0, true, false, 0);
        }

    }

    if (Date.now() > timeBetweenAnimChecks) {
        timeBetweenAnimChecks = Date.now() + 1500;
        if (!native.isEntityPlayingAnim(vehicle.scriptID, 'nm@hands', 'hands_up', 3)) {
            alt.emit('animation:Play', {
                dict: 'nm@hands',
                name: 'hands_up',
                duration: -1,
                flag: 2
            });
        }
    }
}

function buyError() {
    if (view)
        view.emit('buyError')
}

function vehicleBought() {
    vehicle.destroy();
    isActive = false;
    alt.showCursor(false);
    if (view) {
        view.unfocus();
        view.destroy();
        view = undefined;
    }
    alt.FocusData.clearFocus();
    destroyPedEditCamera();
}