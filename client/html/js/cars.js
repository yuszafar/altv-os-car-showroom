const MAX_CAR_PARAMS_MAP = Object.freeze({
    speed: 200,
    acceleration: 100,
    traction: 100,
    braking: 100,
});

const COLORS = [{
        id: 0,
        description: 'Metallic Black',
        hex: '#0d1116',
        rgb: '13, 17, 22'
    },
    {
        id: 2,
        description: 'Metallic Black Steal',
        hex: '#32383d',
        rgb: '50, 56, 61'
    },
    {
        id: 3,
        description: 'Metallic Dark Silver',
        hex: '#454b4f',
        rgb: '69, 75, 79'
    },
    {
        id: 5,
        description: 'Metallic Blue Silver',
        hex: '#c2c4c6',
        rgb: '194, 196, 198'
    },
    {
        id: 27,
        description: 'Metallic Red',
        hex: '#c00e1a',
        rgb: '192, 14, 26'
    },
    {
        id: 38,
        description: 'Metallic Orange',
        hex: '#f78616',
        rgb: '247, 134, 22'
    },
    {
        id: 55,
        description: 'Matte Lime Green',
        hex: '#66b81f',
        rgb: '102, 184, 31'
    },
    {
        id: 70,
        description: 'Metallic Bright Blue',
        hex: '#0b9cf1',
        rgb: '11, 156, 241'
    },
    {
        id: 89,
        description: 'Metallic Race Yellow',
        hex: '#fbe212',
        rgb: '251, 226, 18'
    },
    {
        id: 111,
        description: 'Metallic White',
        hex: '#fffff6',
        rgb: '255, 255, 246'
    }
];

const CARS = [
    {
        display: 'Cheval Picador',
        name: 'picador',
        type: 'Car',
        class: 'Muscle',
        brand: 'Cheval',

        price: 120000,
        seats: 2,
        trunk_weight: 60,
        trunk_slot: 50,
        fuel_tank_volume: 60,

        speed: 72,
        acceleration: 55,
        braking: 26,
        traction: 62,
    }
];

const formatPrice = (s) =>
    s?.toString().replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');

new Vue({
    el: '#cars',

    data() {
        return {
            cars: [],
            activeCar: '',
            activeCarId: 0,
            search: '',

            isFilterVisible: false,
            filterList: [],
            filter: '',

            colors: [],
            selectedColor: {
                primary: '',
                extra: '',
            },

            isModalVisible: false,
        };
    },

    computed: {
        carsList() {
            const searchList = this.cars.filter((car) =>
                car.param.display.toLowerCase().includes(this.search.toLowerCase())
            );

            if (!this.filter) {
                return searchList;
            }

            return searchList.filter(
                (car) => car.param.brand.toLowerCase() === this.filter.toLowerCase()
            );
        },

        selectedCarDetails() {
            return this.carsList.find((car) => car?.param?.name === this.activeCar);
        },

        isCarDetailsVisible() {
            return !!this.selectedCarDetails?.param.name;
        },
    },

    mounted() {
        this.initData();
        alt.on('setCars', this.setCars);

        alt.on('buyError', this.toggleModal);
    },

    methods: {
        formatPrice,
        setCars(cars) {
            this.cars = cars;
            this.initFilterList();
        },
        initData() {
            this.initColors();
        },

        initFilterList() {
            this.filterList = Array.from(new Set(this.cars.map((car) => car.param.brand)));
        },

        initColors() {
            this.colors = COLORS;
            const [defaultColor] = this.colors;

            this.selectColor('primary', defaultColor);
            this.selectColor('extra', defaultColor);
        },

        isCarActive(name) {
            return this.activeCar === name;
        },

        selectCarHandler(name, id) {
            alt.emit("vehicleShop:setModel", name);


            if (this.activeCar === name) {
                this.activeCar = '';

                return;
            }
            this.activeCarId = id;
            this.activeCar = name;
        },

        toggleFilter() {
            this.isFilterVisible = !this.isFilterVisible;
        },

        closeFilter() {
            this.isFilterVisible = false;
        },

        isFilterActive(filter) {
            return this.filter === filter;
        },

        selectFilterHandler(filter) {
            if (this.filter === filter) {
                this.filter = '';

                return;
            }

            this.filter = filter;
        },

        selectColor(field, color) {
            this.selectedColor[field] = color;
            alt.emit("vehicleShop:setColor", this.selectedColor["primary"]["id"], this.selectedColor["extra"]["id"]);
        },

        isColorActive(field, color) {
            return this.selectedColor[field] === color;
        },

        getCarParamsLines(field, value) {
            return Math.floor(value / (MAX_CAR_PARAMS_MAP[field] / 4));
        },

        submit() {
            alt.emit("vehicleShop:buyVehicle", this.activeCarId, this.selectedColor["primary"]["id"], this.selectedColor["extra"]["id"]);
        },

        toggleModal() {
            this.isModalVisible = !this.isModalVisible;
        },
    },
});
