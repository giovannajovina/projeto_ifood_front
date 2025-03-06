document.addEventListener("DOMContentLoaded", function () {
    const openModalBtn = document.getElementById("openModalBtn");
    const modal = document.getElementById("addressModal");
    const closeModal = document.querySelectorAll(".close");
    const addressSearch = document.getElementById("addressSearch");
    const suggestionsList = document.getElementById("suggestions");
    const savedAddressesList = document.getElementById("savedAddresses");
    const saveAddressBtn = document.getElementById("saveAddress");

    let autocomplete, selectedAddressData;

    // 🔥 1. Pegar o `user_id` do LocalStorage
    function getUserId() {
        const user = JSON.parse(localStorage.getItem("user_data"));
        return user ? user.id : null;
    }

    // 🔥 2. Função para buscar os endereços da API
    async function loadSavedAddresses() {
        const userId = getUserId();
        if (!userId) {
            console.error("Erro: Usuário não encontrado no LocalStorage.");
            return;
        }

        try {
            const response = await fetch(`https://sua-api.com/enderecos?user_id=${userId}`);
            if (!response.ok) throw new Error("Erro ao buscar endereços da API.");

            const addresses = await response.json();

            // Limpa a lista antes de adicionar os novos endereços
            savedAddressesList.innerHTML = "";

            // Exibir os endereços cadastrados
            addresses.forEach(address => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="saved-address">
                        <span><strong>${address.logradouro}, ${address.numero}</strong></span>
                        <p>${address.bairro} - ${address.cidade}, ${address.estado}</p>
                    </div>
                `;
                li.addEventListener("click", () => selectSavedAddress(address));
                savedAddressesList.appendChild(li);
            });

        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
        }
    }

    // 🔥 3. Selecionar um endereço salvo e preencher os campos
    function selectSavedAddress(address) {
        selectedAddressData = { ...address };

        document.getElementById("selectedAddress").innerText =
            `${address.logradouro}, ${address.bairro} - ${address.cidade}, ${address.estado}`;

        modal.style.display = "none";
        document.getElementById("addressDetailsModal").style.display = "flex";
    }

    // 🔥 4. Abrir modal e carregar endereços da API
    openModalBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        loadSavedAddresses(); // Busca os endereços cadastrados
    });

    // 🔥 5. Inicializar Google Places Autocomplete
    function initAutocomplete() {
        autocomplete = new google.maps.places.Autocomplete(addressSearch, {
            types: ['geocode'],
            componentRestrictions: { country: 'BR' }
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                alert("Endereço inválido. Tente novamente.");
                return;
            }
            showAddressDetails(place);
        });
    }

    // 🔥 6. Captura os detalhes do endereço selecionado do Google Places
    function showAddressDetails(place) {
        console.log("Endereço recebido do Google Places:", place);

        if (!place.geometry) {
            alert("Endereço inválido. Tente novamente.");
            return;
        }

        const addressComponents = place.address_components;
        selectedAddressData = {
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            complemento: "",
            user_id: 1
            // user_id: getUserId()
        };

        addressComponents.forEach((component) => {
            const types = component.types;

            if (types.includes("route")) selectedAddressData.logradouro = component.long_name;
            if (types.includes("street_number")) selectedAddressData.numero = component.long_name;
            if (types.includes("sublocality") || types.includes("sublocality_level_1")) selectedAddressData.bairro = component.long_name;
            if (types.includes("administrative_area_level_2")) selectedAddressData.cidade = component.long_name;
            if (types.includes("administrative_area_level_1")) selectedAddressData.estado = component.short_name;
            if (types.includes("postal_code")) selectedAddressData.cep = component.long_name;
        });

        console.log("Dados processados do endereço:", selectedAddressData);

        // Exibir endereço no modal de detalhes
        document.getElementById("selectedAddress").innerText =
            `${selectedAddressData.logradouro}, ${selectedAddressData.bairro} - ${selectedAddressData.cidade}, ${selectedAddressData.estado}`;

        modal.style.display = "none";
        document.getElementById("addressDetailsModal").style.display = "flex";
    }

    // 🔥 7. Salvar endereço no LocalStorage
    saveAddressBtn.addEventListener("click", () => {
        if (!selectedAddressData || !selectedAddressData.logradouro) {
            alert("Selecione um endereço antes de salvar.");
            return;
        }

        selectedAddressData.numero = document.getElementById("numero").value || "";
        selectedAddressData.complemento = document.getElementById("complemento").value || "";

        localStorage.setItem("endereco_selecionado", JSON.stringify(selectedAddressData));

        alert("Endereço salvo com sucesso!");
        console.log("Endereço salvo:", selectedAddressData);

        document.getElementById("addressDetailsModal").style.display = "none";
    });

    window.initAutocomplete = initAutocomplete;
});
