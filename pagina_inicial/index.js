
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

   // 🔥 2. Buscar endereços do usuário e exibi-los
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

    try {
        const response = await fetch(`https://clickfood.shop/api/enderecos/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${await response.text()}`);
        }

        const responseData = await response.json();
        savedAddressesList.innerHTML = "";

        if (!responseData.success || responseData.data.length === 0) {
            savedAddressesList.innerHTML = "<p>Nenhum endereço salvo.</p>";
            return;
        }

        responseData.data.forEach(address => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="saved-address">
                    <span><strong>${address.logradouro}, ${address.numero}</strong></span>
                    <p>${address.bairro} - ${address.cidade}, ${address.estado}</p>
                    <button class="delete-address" data-id="${address.id}">🗑 Excluir</button>
                </div>
            `;

            li.addEventListener("click", () => selectSavedAddress(address));
            savedAddressesList.appendChild(li);
        });

        // Adiciona evento para os botões de exclusão
        document.querySelectorAll(".delete-address").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation(); // Evita que o clique no botão selecione o endereço
                const addressId = event.target.getAttribute("data-id");
                deleteAddress(addressId);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar endereços:", error);
        savedAddressesList.innerHTML = "<p>Erro ao carregar endereços.</p>";
    }
}


    
    // Chamando a função ao carregar a página
    window.onload = () => {
        loadSavedAddresses();
    };
    

    // 🔥 3. Selecionar um endereço salvo e preencher os campos
    function selectSavedAddress(address) {
        selectedAddressData = { ...address };
    
        document.getElementById("selectedAddress").innerText =
            `${address.logradouro}, ${address.bairro} - ${address.cidade}, ${address.estado}`;
    
        document.getElementById("addressModal").style.display = "none";
        document.getElementById("addressDetailsModal").style.display = "flex";
    }
    

    // 🔥 . Abrir modal e carregar endereços da API
    openModalBtn.addEventListener("click", () => {
        modal.style.display = "flex";
        loadSavedAddresses(); // Busca os endereços cadastrados
    });
    openModalBtn_mobile.addEventListener("click", () => {
        modal.style.display = "flex";
        loadSavedAddresses(); // Busca os endereços cadastrados
    });

    // 🔥 4. Inicializar Google Places Autocomplete
    function initAutocomplete() {
        const addressInput = document.getElementById("addressSearch");
    
        if (!addressInput) {
            console.error("⚠️ Campo de pesquisa de endereço (#addressSearch) não encontrado no DOM.");
            return;
        }
    
        // Inicializa o Autocomplete
        autocomplete = new google.maps.places.Autocomplete(addressInput, {
            types: ["geocode"], // Sugerir apenas endereços
            componentRestrictions: { country: "BR" }, // Restringe ao Brasil
            fields: ["address_components", "geometry", "formatted_address"] // Retorna apenas os dados necessários
        });
    
        // Adiciona evento para capturar a seleção do endereço
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                alert("Endereço inválido. Tente novamente.");
                return;
            }
            showAddressDetails(place);
        });
    
        console.log("✅ Google Places Autocomplete inicializado com sucesso.");
    }
    
    // Chamar initAutocomplete() quando o script do Google carregar
    window.initAutocomplete = initAutocomplete;
    

    // 🔥 5. Captura os detalhes do endereço selecionado do Google Places
    function showAddressDetails(place) {
        if (!place || !place.geometry || !place.geometry.location) {
            alert("Endereço inválido. Tente novamente.");
            return;
        }
    
        console.log("📍 Endereço recebido:", place);
    
        const addressComponents = place.address_components;
        selectedAddressData = {
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            complemento: "",
            latitude: place.geometry.location.lat,  // ✅ Ajustado para ser um número, não uma função
            longitude: place.geometry.location.lng, // ✅ Ajustado para ser um número, não uma função
            user_id: getUserId()
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
    
        console.log("✅ Endereço detectado:", selectedAddressData);
    
        // 🔥 Atualiza a interface com o endereço encontrado
        document.getElementById("selectedAddress").innerText =
            `${selectedAddressData.logradouro}, ${selectedAddressData.bairro} - ${selectedAddressData.cidade}, ${selectedAddressData.estado}`;
    
        // Fecha a modal principal e abre a de confirmação
        document.getElementById("addressModal").style.display = "none";
        document.getElementById("addressDetailsModal").style.display = "flex";
    }
    
    document.getElementById("closeAddressDetails").addEventListener("click", () => {
        document.getElementById("addressDetailsModal").style.display = "none";
    });
    
    

    // 🔥 6. localização atual
    async function getUserLocation() {
        if (!navigator.geolocation) {
            alert("Geolocalização não é suportada pelo seu navegador.");
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("📍 Localização capturada:", latitude, longitude);
    
                // 🔥 Buscar o endereço correspondente usando a API do Google Maps
                await getAddressFromCoordinates(latitude, longitude);
            },
            (error) => {
                console.error("Erro ao obter localização:", error);
                alert("Erro ao obter sua localização. Certifique-se de permitir o acesso ao GPS.");
            },
            {
                enableHighAccuracy: true, // ✅ ATIVANDO MODO DE ALTA PRECISÃO
                timeout: 10000, // ✅ TEMPO LIMITE PARA OBTER LOCALIZAÇÃO (10s)
                maximumAge: 0 // ✅ SEM USAR LOCALIZAÇÕES ANTIGAS (PEGA DADO ATUALIZADO)
            }
        );
    }
    

    async function getAddressFromCoordinates(latitude, longitude) {
        const apiKey = "AIzaSyBkykjH21ut-e8c_F90tJmgO6IX2KvALZ4&libraries"; // 🔴 Substitua com sua chave real da API do Google Maps
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.status !== "OK") {
                throw new Error("Erro ao obter endereço.");
            }
    
            console.log("📍 Endereço obtido da API:", data.results[0]);
    
            // 🔥 Criar um objeto `place` manualmente para ser compatível com `showAddressDetails()`
            const place = {
                address_components: data.results[0].address_components,
                geometry: {
                    location: {
                        lat: latitude,
                        lng: longitude
                    }
                }
            };
    
            // 🔥 Enviar os dados corrigidos para a função de exibição
            showAddressDetails(place);
    
        } catch (error) {
            console.error("Erro ao obter endereço:", error);
            alert("Erro ao obter endereço da sua localização.");
        }
    }
    

    const useLocationButton = document.getElementById("useMyLocation");

    if (useLocationButton) {
        useLocationButton.addEventListener("click", () => {
            console.log("🛰️ Botão 'Usar minha localização' clicado!");
            getUserLocation();
        });
    } else {
        console.warn("⚠️ Botão 'Usar minha localização' não encontrado no DOM.");
    }

    // 🔥 7. Salvar endereço no banco e no Local Storage
    saveAddressBtn.addEventListener("click", async () => {
        if (!selectedAddressData || !selectedAddressData.logradouro) {
            alert("Selecione um endereço antes de salvar.");
            return;
        }

        const userId = getUserId();
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            alert("Você precisa estar logado.");
            return;
        }

        const response = await fetch(`https://clickfood.shop/api/enderecos/save`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(selectedAddressData)
        });

        const responseData = await response.json();
        if (responseData.success) {
            selectedAddressData.id = responseData.data.id;
            localStorage.setItem("endereco_selecionado", JSON.stringify(selectedAddressData));
            loadSavedAddresses();
            alert("Endereço salvo com sucesso!");
        } else {
            alert("Erro ao salvar.");
        }
    });
    async function deleteAddress(enderecoId) {
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("Você precisa estar logado.");
            return;
        }
    
        const confirmDelete = confirm("Tem certeza que deseja excluir este endereço?");
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(`https://clickfood.shop/api/enderecos/delete/${enderecoId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
    
            const responseData = await response.json();
    
            if (response.ok) {
                alert("Endereço excluído com sucesso!");
                loadSavedAddresses(); // Atualiza a lista após exclusão
            } else {
                alert(responseData.message || "Erro ao excluir endereço.");
            }
    
        } catch (error) {
            console.error("Erro ao excluir endereço:", error);
            alert("Erro ao excluir endereço. Tente novamente.");
        }
    }
    

    window.initAutocomplete = initAutocomplete;
});
