import Details from '../routes/details/index.js';
import Home from '../routes/home/index.js';

export default class Router {
    #routes = [
        {
            path: '/',
            title: 'Home',
            template: '/routes/home/index.html',
            script: '/routes/home/index.js',
            init: new Home().init
        },
        {
            path: '/details',
            title: 'Details',
            template: '/routes/details/index.html',
            script: '/routes/details/index.js',
            init: new Details().init
        },
    ];

    constructor() {
        window.onpopstate = this.handleLocation;
        window.route = this.route;

        this.handleLocation()
    }

    route = (event) => {
        event = event || window.event;
        event.preventDefault();
        window.history.pushState({}, "", event.target.href);
        handleLocation();
    };

    handleLocation = async () => {
        const path = window.location.pathname;

        const route = this.#routes.find((route) => route.path === path);
        const html = await fetch(route.template).then((data) => data.text());

        const content = document.getElementById("content")
        content.innerHTML = html;
        document.title = route.title;
        content.querySelector('.container').setAttribute('aria-live', 'assertive')

        const script = document.createElement('script');
        script.src = route.script;
        script.type = 'module';

        script.addEventListener('load', route.init);

        content.appendChild(script);
    };
}


