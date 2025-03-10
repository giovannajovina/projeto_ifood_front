document.addEventListener("DOMContentLoaded", function () {
    const closeModal = document.querySelectorAll(".close-loc");
    const addressSearch = document.getElementById("addressSearch");
    const suggestionsList = document.getElementById("suggestions");
    const savedAddressesList = document.getElementById("savedAddresses");
    const saveAddressBtn = document.getElementById("saveAddress");
    const modal = document.getElementById("addressModal");
    const closeModalBtn = document.querySelector(".close_loc");
    const openModalBtn = document.getElementById("openModalBtn");
    const openModalBtn_mobile = document.getElementById("openModalBtn-mobile");
openModalBtn
    // Verifica se o botão existe antes de adicionar o evento
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    } else {
        console.warn("⚠️ Botão #openModalBtn não encontrado no DOM.");
    }
    if (openModalBtn_mobile) {
        openModalBtn_mobile.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    } else {
        console.warn("⚠️ Botão #openModalBtn_mobile não encontrado no DOM.");
    }

    // Verifica se o botão de fechar existe
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    } else {
        console.warn("⚠️ Botão de fechar modal não encontrado.");
    }

    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
    let autocomplete, selectedAddressData;

    // 🔥 1. Pegar o `user_id` do LocalStorage
    function getUserId() {
        const user = JSON.parse(localStorage.getItem("user"));
        return user ? user.id : null;
    }

    // 🔥 2. Função para buscar os endereços da API
    async function loadSavedAddresses() {
        const userId = getUserId();
        if (!userId) {
            console.error("Erro: Usuário não encontrado no LocalStorage.");
            return;
        }
    
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Erro: Token de autenticação não encontrado.");
            return;
        }
    
        const savedAddressesList = document.getElementById("savedAddresses");
        if (!savedAddressesList) {
            console.error("Erro: Elemento 'savedAddresses' não encontrado no DOM.");
            return;
        }
    
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/enderecos/user/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Erro na API: ${responseText}`);
            }
    
            const responseData = await response.json();
            console.log("Resposta da API:", responseData);
    
            // 🔥 Transforma em array se não for
            const addresses = Array.isArray(responseData) ? responseData : [responseData];
    
            savedAddressesList.innerHTML = "";
    
            addresses.forEach(address => {
                console.log("Adicionando endereço:", address);
    
                const logradouro = address.logradouro || "Logradouro desconhecido";
                const numero = address.numero || "s/n";
                const bairro = address.bairro || "";
                const cidade = address.cidade || "";
                const estado = address.estado || "";
    
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="saved-address">
                        <span><strong>${logradouro}, ${numero}</strong></span>
                        <p>${bairro} - ${cidade}, ${estado}</p>
                    </div>
                `;
    
                li.addEventListener("click", () => selectSavedAddress(address));
                savedAddressesList.appendChild(li);
            });
    
        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
        }
    }
    
    // Chamando a função ao carregar a página
    window.onload = () => {
        loadSavedAddresses();
    };
    
    // Chamando a função ao carregar a página
    window.onload = () => {
        loadSavedAddresses();
    };
    

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
    openModalBtn_mobile.addEventListener("click", () => {
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
