export default class Details {
    #product;
    #api_key;
    #commentsContainer;
    #codereseau;

    constructor() {
        this.#product = null;
        this.#api_key = 'WVRrckJTYjI5bzRyVkllVDVEdzdXUzZiS0Y2bkh3WGNoMGdWd2hwaA==';
        this.#codereseau = 'e1234567';
    }

    // Initialisation de la fonction
    init = async () => {
        this.#commentsContainer = document.querySelector('.comments-container');
        this.#commentsContainer.querySelector('form').addEventListener('submit', this.addComment);

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 1;

        // Récupérer le produit
        this.fetchProduct(id)
            .then(() => {
                this.displayProduct();
                this.displayComments();
            });

        this.populateSelects();
    }

    // Récupérer le produit
    fetchProduct = async (id) => {
        if (id === null) return;
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${id}`);
            this.#product = await response.json();
        } catch (e) {
            console.log(e);
        }
    }

    // Afficher le produit
    displayProduct = () => {
        const product = this.#product;
        const main = document.querySelector('main');
        this.#commentsContainer.style = "display: block;"

        while (main?.firstChild) {
            main?.removeChild(main.firstChild);
        }

        main.innerHTML = `
            <div class="details">
                <div class="details__product">
                    <div class="details__image">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="details__content">
                        <h1>${product.title}</h1>
                        <ul>
                            <li><p><b>Description: </b>${product.description}</p></li>
                            <li><b>Prix:</b>${product.price} €</li>
                            <li><b>Catégorie: </b>${product.category}</li>
                            <li><b>Évaluation: ${product.rating.rate}</b></li>
                        </ul>

                        <button>Ajouter aux panier</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Récupérer les données des pays, états et villes
    fetchCoutryStateCity = async (endpoint) => {
        var headers = new Headers();
        headers.append("X-CSCAPI-KEY", this.#api_key);

        var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        try {
            const res = await fetch(`https://api.countrystatecity.in/v1/${endpoint}`, requestOptions)
            const data = await res.json()
            return data
        } catch (e) {
            alert(e.message)
        }
    }

    // Remplir les listes déroulantes des pays, états et villes
    populateSelects = async () => {
        const countriesSelect = document.querySelector('#countries-select')
        const statesSelect = document.querySelector('#states-select')
        const citySelect = document.querySelector('#city-select')

        const countries = await this.fetchCoutryStateCity('countries')

        countries.forEach(c => {
            const option = document.createElement('option')
            option.value = c.name + '-' + c.iso2
            option.textContent = c.name
            countriesSelect.appendChild(option)
        })

        countriesSelect.addEventListener('change', async (e) => {
            const states = await this.fetchCoutryStateCity(`countries/${e.target.value.split('-')[1]}/states`)
            statesSelect.innerHTML = '<option disabled selected value="none">Choisir une provinance</option>'

            states.forEach(c => {
                const option = document.createElement('option')
                option.value = c.name + '-' + c.iso2
                option.textContent = c.name
                statesSelect.appendChild(option)
            })
        })

        statesSelect.addEventListener('change', async (e) => {
            const states = await this.fetchCoutryStateCity(`countries/${countriesSelect.value.split('-')[1]}/states/${e.target.value.split('-')[1]}/cities`)
            citySelect.innerHTML = '<option disabled selected value="none">Choisissez une ville</option>'

            states.forEach(c => {
                const option = document.createElement('option')
                option.value = c.name
                option.textContent = c.name
                citySelect.appendChild(option)
            })
        })
    }

    // Afficher les commentaires
    displayComments = async () => {
        const main = this.#commentsContainer.querySelector('main')

        try {
            const res = await fetch(`https://maisonneuve.maximepigeon.workers.dev/${this.#codereseau}`)
            let data = await res.json()

            if (!Array.isArray(data)) {
                return main.textContent = 'Aucun commentaire'
            }

            data = data
                .filter(c => Boolean(c.comment))
                .filter(c => c.productId === this.#product.id)

            while (main?.firstChild) {
                main?.removeChild(main.firstChild);
            }

            if (!data?.length) {
                return main.textContent = 'Aucun commentaire'
            }

            return data.map(c => {
                const div = document.createElement('div')
                div.classList.add('comment')

                div.innerHTML = `
                    <div class="info">
                        <h3>${c.firstname} ${c.lastname}</h3> |
                        <p>${c.country?.split('-')[0]}, ${c.state?.split('-')[0]}, ${c.city?.split('-')[0]}</p>
                    </div>
                    <p>${c.comment}</p>
                `
                main.appendChild(div)
            })
        } catch (e) {
            alert(e.message)
        }
    }

    // Ajouter un commentaire
    addComment = async (e) => {
        e.preventDefault()

        let values = Object.fromEntries(new FormData(e.target).entries())

        if (
            !values.lastname || !values.firstname
            || !values.email || !values.country
            || !values.state || !values.city || !values.comment
            || values.country === 'none' || values.state === 'none' || values.city === 'none'
        ) {
            return alert('Veuillez remplir tous les champs')
        }

        const commets = JSON.parse(localStorage.getItem('comments')) || []
        commets.push({
            ...values,
            productId: this.#product.id
        })

        const submitBtn = this.#commentsContainer.querySelector('form').querySelector('button')

        try {
            submitBtn.disabled = true
            submitBtn.textContent = 'Submission En cours...'
            const res = await fetch(`https://maisonneuve.maximepigeon.workers.dev/${this.#codereseau}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commets)
            })

            const data = await res.json()
            localStorage.setItem('comments', JSON.stringify(data))
            this.#commentsContainer.querySelector('form').reset()
            await this.displayComments()
            alert('Commentaire ajouté avec succès')

        } catch (e) {
            alert(e.message)
        } finally {
            submitBtn.disabled = false
            submitBtn.textContent = 'Ajouter'
        }
    }
}

const details = new Details();
