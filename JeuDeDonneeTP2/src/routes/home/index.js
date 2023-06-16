import Router from '../../lib/Router.js';

export default class Home {
    #products       // Liste des produits
    #search         // Terme de recherche
    #categories     // Catégories sélectionnées
    #sort           // Tri des produits
    #display        // Mode d'affichage des produits
    #overlay        // Elément d'overlay
    #aside          // Elément de la barre latérale

    // Constructeur de la classe
    constructor() {
        this.#search = '';
        this.#overlay = null;
        this.#aside = null;
        this.#categories = [];
        this.#sort = 'title-asc';
        this.#display = 'list';
    }

    init = () => {
        this.#aside = document.querySelector('aside');
        this.#overlay = document.querySelector('.overlay');
        
        document.querySelectorAll('input[name="display"]').forEach((radio) => {
            radio.addEventListener('change', () => this.changeDisplay(radio))
        })

        document.querySelectorAll('.category').forEach((cat) => {
            cat.addEventListener('change', () => this.updateCategories(cat.value))
        })

        document.querySelector('#sort-select')?.addEventListener('change', (e) => this.updateSort(e.target.value))

        document.querySelector('#open-aside')?.addEventListener('click', this.openAside)

        document.querySelector('#close-aside')?.addEventListener('click', this.closeAside)

        document.querySelector('#searchFrom')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = e.target.querySelector('input[type="search"]').value
            this.searchProducts(value)
        });

        document.querySelector('#formSearchInput')?.addEventListener('input', this.clearSearch);


        const params = new URLSearchParams(window.location.search);
        const sort = String(params.get('sort'))
        const categories = String(params.get('categories'))
        const search = String(params.get('search'))

        this.fetchProducts()
            .then(() => {
                this.displayProducts()

                if (!sort || sort !== 'null') {
                    this.updateSort(sort)
                }

                if (!categories || categories !== 'null') {
                    this.updateCategories(categories.split(','))
                }

                if (search && search !== 'null') {
                    this.searchProducts(search)
                }
            })
    }

    // Méthode pour récupérer les produits à partir d'une API
    fetchProducts = async () => {
        try {
            // Appel à l'API fakestoreapi pour récupérer les produits
            const response = await fetch("https://fakestoreapi.com/products");
            this.#products = await response.json();
        } catch (e) {
            console.log(e);
        }
    }

    // Méthode pour afficher les produits
    displayProducts = () => {
        const mainEl = document.querySelector("main");

        // Suppression des éventuels éléments enfants de main
        while (mainEl?.firstChild) {
            mainEl?.removeChild(mainEl.firstChild);
        }

        // Création d'un élément de liste pour les produits
        const ulEl = document.createElement("ul");
        ulEl.classList.add("products");
        ulEl.classList.add(this.#display);

        const products = this.#products
            .filter(product => {
                // Filtrage des produits en fonction du terme de recherche
                if (!this.#search) return true;
                return product.title.toLowerCase().includes(this.#search.toLowerCase()) ||
                    product.description.toLowerCase().includes(this.#search.toLowerCase());
            })
            .filter(product => {
                // Filtrage des produits en fonction des catégories sélectionnées
                return this.#categories.length ? this.#categories.includes(product.category) : true;
            })
            .sort((a, b) => {
                // Tri des produits en fonction de la clé de tri sélectionnée
                const [key, sort] = this.#sort.split('-');
                if (sort === 'asc') {
                    return a[key] > b[key] ? 1 : -1;
                } else {
                    return a[key] < b[key] ? 1 : -1;
                }
            });

        // Vérification s'il n'y a aucun produit trouvé
        if (products.length === 0) {
            const pEl = document.createElement('p');
            pEl.textContent = 'Aucun produit trouvé';
            mainEl?.appendChild(pEl);
        }

        products.map(product => {
            // Création d'un élément de liste pour chaque produit
            const liEl = document.createElement("a");
            liEl.classList.add("product");

            liEl.href = `/details?id=${product.id}`;

            liEl.addEventListener('click', (e) => {
                e.preventDefault()
                window.history.pushState({}, '', `/details?id=${product.id}`)
                new Router().handleLocation()
            })

            // Création d'un élément d'article pour les détails du produit
            const articleEl = document.createElement("article");

            // Insertion du code HTML et récupération des données à partir du JSON pour chaque produit
            articleEl.innerHTML = `
                <img src="${product.image}" alt="Image pour ${product.title}">
                <div class="details-outer">
                    <h2>${product.title.split(' ').slice(0, 6).join(' ')}</h2>
                    <ul class="details">
                        <li><span>Prix :</span>$${product.price}</li>
                        <li><span>Catégorie :</span>${product.category}</li>
                        <li><span>Évaluation :</span>
                            <div class="rating">
                                ${product.rating.rate}
                                <svg width="15" height="15" fill="#FFD700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <!-- Ici se trouve le code SVG pour l'évaluation -->
                                </svg>
                            </div>
                        </li>
                    </ul>
                </div>
            `;

            // Ajout de l'article à l'élément de liste
            liEl.appendChild(articleEl);
            // Ajout de l'élément de liste à l'élément principal         
            ulEl.appendChild(liEl);
        });

        // Ajout de l'élément de liste à l'élément principal
        mainEl?.appendChild(ulEl);
    }

    // Méthode pour ouvrir la barre latérale
    openAside = () => {
        this.#aside.classList.add('open');
        this.#overlay.style.display = 'block';
    }

    // Méthode pour fermer la barre latérale
    closeAside = () => {
        this.#aside.classList.remove('open');
        this.#overlay.style.display = 'none';
    }

    // Méthode pour changer le mode d'affichage des produits (liste ou grille)
    changeDisplay = (e) => {
        const productsEl = document.querySelector('.products');

        if (e.value === 'list') {
            this.#display = 'list';
            productsEl.classList.remove('grid');
            productsEl.classList.add('list');
            return;
        }

        this.#display = 'grid';
        productsEl.classList.remove('list');
        productsEl.classList.add('grid');
    }

    // Méthode pour effectuer une recherche de produits
    searchProducts = (value) => {
        this.#search = value;
        this.displayProducts();
        this.updateURLParams('search', value);
    }

    // Méthode pour effacer la recherche et afficher tous les produits
    clearSearch = (e) => {
        if (e.target.value !== '') return;
        this.#search = '';
        this.displayProducts();
    }

    updateCategories = (value) => {
        if (Array.isArray(value)) {
            this.#categories = value;
        } else {
            if (this.#categories.includes(value)) {
                this.#categories = this.#categories.filter(cat => cat !== value);
            } else {
                this.#categories.push(value);
            }
        }

        this.displayProducts();
        this.updateURLParams('categories', this.#categories.join(','));
    }

    // Méthode pour mettre à jour le tri des produits
    updateSort = (value) => {
        this.#sort = value
        this.displayProducts();
        this.updateURLParams('sort', value)
    }


    updateURLParams = (key, value) => {
        const params = new URLSearchParams(window.location.search);
        params.set(key, value);

        const url = window.location.pathname + '?' + params.toString();
        window.history.replaceState(null, null, url);
    }
}

const home = new Home();

