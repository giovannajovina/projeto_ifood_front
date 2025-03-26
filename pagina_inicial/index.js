
document.addEventListener("DOMContentLoaded", function () {
    // if (typeof google !== "undefined" && google.maps) {
    //     initAutocomplete();
    // } else {
    //     console.warn("⚠️ API do Google Maps ainda não carregada.");
    // }

    const closeModal = document.querySelectorAll(".close-loc");
    const addressSearch = document.getElementById("addressSearch");
    const suggestionsList = document.getElementById("suggestions");
    const savedAddressesList = document.getElementById("savedAddresses");
    const saveAddressBtn = document.getElementById("saveAddress");
    const modal = document.getElementById("addressModal");
    const closeModalBtn = document.querySelector(".close_loc");
    const openModalBtn = document.getElementById("openModalBtn");
    const openModalBtn_mobile = document.getElementById("openModalBtn-mobile");
    let savedAddresses = []; // Array global para armazenar os endereços carregados
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
            const response = await fetch(`http://127.0.0.1:8000/api/enderecos/user/${userId}`, {
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

            savedAddresses = responseData.data; // 🔥 Armazena os endereços carregados globalmente
            const enderecoSelecionado = JSON.parse(localStorage.getItem("endereco_selecionado"));

            savedAddresses.forEach(address => {
                const li = document.createElement("li");
                li.classList.add("saved-address");

                li.innerHTML = `
                    <div>
                        <span><strong>${address.logradouro}, ${address.numero}</strong></span>
                        <p>${address.bairro} - ${address.cidade}, ${address.estado}</p>
                    </div>
                    <button class="delete-address" data-id="${address.id}">🗑 Excluir</button>
                    <button class="edit-address-btn" data-id="${address.id}">📝 Editar</button>
                `;

                // Se o endereço do localStorage for o mesmo, adiciona a classe "selected-address"
                if (enderecoSelecionado && enderecoSelecionado.id === address.id) {
                    li.classList.add("selected-address");
                }

                li.addEventListener("click", function () {
                    selectSavedAddress(address, li);
                });

                savedAddressesList.appendChild(li);
            });

            document.querySelectorAll(".delete-address").forEach(button => {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    const addressId = this.getAttribute("data-id");
                    deleteAddress(addressId);
                });
            });

            document.querySelectorAll(".edit-address-btn").forEach(button => {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    const addressId = this.getAttribute("data-id");
                    const address = savedAddresses.find(addr => addr.id == addressId);
                    if (address) {
                        openEditModal(address);
                    } else {
                        console.error("Erro: Endereço com ID", addressId, "não encontrado.");
                    }
                });
            });

        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
            savedAddressesList.innerHTML = "<p>Nenhum endereço encontrado.</p>";
        }
    }


    function handleDeleteClick(event) {
        event.stopPropagation(); // 🔥 Evita que o clique acione eventos indesejados

        const addressId = this.getAttribute("data-id");
        console.log("🗑 Excluindo endereço com ID:", addressId);

        deleteAddress(addressId);
    }
    function handleEditClick(event) {
        event.stopPropagation(); // 🔥 Impede que clique no botão afete outros elementos

        const addressId = this.getAttribute("data-id");
        console.log("🔍 ID do endereço selecionado para edição:", addressId);

        // Busca o endereço correto no array `savedAddresses`
        const address = savedAddresses.find(addr => addr.id == addressId);

        if (address) {
            console.log("🏠 Endereço encontrado:", address);
            openEditModal(address);
        } else {
            console.error("🚨 Erro: Endereço com ID", addressId, "não encontrado.");
        }
    }

    




    // Chamando a função ao carregar a página
 


    // 🔥 3. Selecionar um endereço salvo e preencher os campos
    function selectSavedAddress(address, element) {
        // Remove a classe de qualquer item previamente selecionado
        document.querySelectorAll(".saved-address").forEach(item => {
            item.classList.remove("selected-address");
        });

        // Adiciona a classe ao item clicado
        element.classList.add("selected-address");

        // Armazena o endereço selecionado no localStorage
        localStorage.setItem("endereco_selecionado", JSON.stringify(address));

        console.log("📌 Endereço selecionado salvo no localStorage:", address);
        buscarLojasProximas()
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
        console.log("✅ initAutocomplete() foi chamada!");
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
    window.onload = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
    
        if (!user || !token) {
            console.warn("⚠️ Usuário não autenticado. Redirecionando...");
            window.location.href = "../login/index.html";
            return;
        }
    
        document.getElementById("nome").textContent = user.nome;
    
        const enderecoSelecionado = JSON.parse(localStorage.getItem("endereco_selecionado"));
    
        if (!enderecoSelecionado || !enderecoSelecionado.latitude || !enderecoSelecionado.longitude) {
            console.warn("⚠️ Nenhum endereço selecionado. Exibindo modal...");
            document.getElementById("addressModal").style.display = "flex";
            loadSavedAddresses();
            return;
        }
    
        // ✅ Usuário autenticado e endereço presente
        loadSavedAddresses();
        buscarLojasProximas();
    };
    

    // 🔥 5. Captura os detalhes do endereço selecionado do Google Places
    function showAddressDetails(place) {
        if (!place || !place.geometry || !place.geometry.location) {
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
            latitude: typeof place.geometry.location.lat === "function"
                ? place.geometry.location.lat()
                : place.geometry.location.lat,

            longitude: typeof place.geometry.location.lng === "function"
                ? place.geometry.location.lng()
                : place.geometry.location.lng,

            user_id: getUserId()
        };

        addressComponents.forEach((component) => {
            const types = component.types;
            if (types.includes("route")) selectedAddressData.logradouro = component.long_name;
            if (types.includes("street_number")) selectedAddressData.numero = component.long_name;
            if (types.includes("sublocality") || types.includes("sublocality_level_1")) selectedAddressData.bairro = component.long_name;
            if (types.includes("administrative_area_level_2")) selectedAddressData.cidade = component.long_name;
            if (types.includes("administrative_area_level_1")) selectedAddressData.estado = component.short_name;
            // if (types.includes("postal_code")) selectedAddressData.cep = component.long_name;
            if (types.includes("postal_code")) {
                selectedAddressData.cep = component.long_name || component.short_name;
            }
        });
        // 🔥 Correção: Captura do CEP com fallback para "short_name"



        // 🔥 Verifique no console se latitude e longitude estão preenchidas
        console.log("✅ Endereço detectado com geolocalização:", selectedAddressData);

        document.getElementById("selectedAddress").innerText =
            `${selectedAddressData.logradouro}, ${selectedAddressData.bairro} - ${selectedAddressData.cidade}, ${selectedAddressData.estado}`;

        document.getElementById("addressModal").style.display = "none";
        document.getElementById("addressDetailsModal").style.display = "flex";

        document.getElementById("numero").addEventListener("input", function () {
            selectedAddressData.numero = this.value;
            console.log("📌 Número atualizado:", selectedAddressData.numero);
        });
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
                c

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
        selectedAddressData.numero = document.getElementById("numero").value;

        // 🔥 Verifica se latitude e longitude estão definidas
        if (!selectedAddressData.latitude || !selectedAddressData.longitude) {
            alert("Erro: Latitude e Longitude não foram capturadas corretamente.");
            console.error("🚨 Latitude ou Longitude indefinida:", selectedAddressData);
            return;
        }

        console.log("📦 Dados enviados para API:", JSON.stringify(selectedAddressData));

        if (!selectedAddressData || !selectedAddressData.logradouro || !selectedAddressData.numero) {
            alert("Preencha todos os campos antes de salvar.");
            return;
        }

        const userId = getUserId();
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            alert("Você precisa estar logado.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/enderecos/save`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedAddressData)
            });

            const textResponse = await response.text();
            console.log("🔍 Resposta completa da API:", textResponse);

            if (!response.ok || textResponse.startsWith("<!DOCTYPE html>")) {
                console.error("🚨 A API retornou HTML. Algo está errado!");
                alert("Erro ao salvar endereço. A API não retornou JSON.");
                return;
            }

            const responseData = JSON.parse(textResponse);
            console.log("✅ Resposta JSON da API:", responseData);

            if (responseData.success) {
                selectedAddressData.id = responseData.data.id;
                localStorage.setItem("endereco_selecionado", JSON.stringify(selectedAddressData));

                loadSavedAddresses();

                document.getElementById("numero").value = "";
                document.getElementById("complemento").value = "";
                document.getElementById("addressSearch").value = "";

                selectedAddressData = {};

                document.getElementById("addressDetailsModal").style.display = "none";
                document.getElementById("addressModal").style.display = "flex";

                alert("✅ Endereço salvo com sucesso!");
            } else {
                alert("❌ Erro ao salvar.");
            }
        } catch (error) {
            console.error("🚨 Erro na requisição:", error);
            alert("Erro ao salvar endereço. Verifique sua conexão.");
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
            const response = await fetch(`http://127.0.0.1:8000/api/enderecos/delete/${enderecoId}`, {
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

    function openEditModal(address) {
        console.log("✏️ Editando endereço:", address);

        selectedAddressData = address; // Atualiza o endereço que está sendo editado

        // Preenche os campos da modal
        document.getElementById("editLogradouro").innerText =
            `${address.logradouro}, ${address.bairro} - ${address.cidade}, ${address.estado}`;

        document.getElementById("editNumero").value = address.numero || "";
        document.getElementById("editComplemento").value = address.complemento || "";

        // 🔥 Exibe a modal e o fundo escuro
        document.getElementById("editAddressModal").style.display = "block";
        document.getElementById("editOverlay").style.display = "block";

        // Define o evento do botão de salvar edição
        document.getElementById("saveEditBtn").onclick = function () {
            saveAddressEdit(address.id);
        };
    }

    // 🔥 Fechar a modal de edição
    function closeEditModal() {
        document.getElementById("editAddressModal").style.display = "none";
        document.getElementById("editOverlay").style.display = "none";
    }

    // 🔥 Fechar modal ao clicar no fundo escuro
    document.getElementById("editOverlay").addEventListener("click", closeEditModal);



    async function saveAddressEdit(addressId) {
        const numero = document.getElementById("editNumero").value;
        const complemento = document.getElementById("editComplemento").value;

        console.log("📦 Salvando endereço editado:", { id: addressId, numero, complemento });

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://127.0.0.1:8000/api/enderecos/update/${addressId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    numero: numero,
                    complemento: complemento
                })
            });

            const responseData = await response.json();
            console.log("🔍 Resposta da API:", responseData);

            if (response.ok && responseData.success) {
                // Atualiza o array `savedAddresses` localmente
                const index = savedAddresses.findIndex(addr => addr.id == addressId);
                if (index !== -1) {
                    savedAddresses[index].numero = numero;
                    savedAddresses[index].complemento = complemento;
                }

                loadSavedAddresses(); // Atualiza a listagem
                document.getElementById("editAddressModal").style.display = "none";
                alert("✅ Endereço atualizado com sucesso!");
            } else {
                alert("❌ Erro ao atualizar.");
            }
        } catch (error) {
            console.error("🚨 Erro na requisição:", error);
            alert("Erro ao atualizar endereço. Verifique sua conexão.");
        }
    }
    async function buscarLojasProximas() {
        // const enderecoSelecionado = JSON.parse(localStorage.getItem("endereco_selecionado"));
        const enderecoSelecionado = JSON.parse(localStorage.getItem("endereco_selecionado"));
        console.log("📍 Endereço selecionado:", enderecoSelecionado);
        if (!enderecoSelecionado || !enderecoSelecionado.latitude || !enderecoSelecionado.longitude) {
            console.error("Endereço selecionado inválido.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/lojas/proximas?latitude=${enderecoSelecionado.latitude}&longitude=${enderecoSelecionado.longitude}`);
            const data = await response.json();

            if (data.success) {
                // console.log(data);
                
                exibirLojasNaTela(data.data);
            } else {
                alert("Erro ao buscar lojas próximas.");
            }
        } catch (error) {
            console.error("Erro ao buscar lojas:", error);
        }
    }

    function exibirLojasNaTela(lojas) {
        const storeList = document.getElementById("store-list");
        storeList.innerHTML = "";

        lojas.forEach(item => {
            const loja = item.loja;
            const div = document.createElement("div");
            div.classList.add("store");
            // div.innerHTML = `
            //     <img src="${loja.logo}" alt="${loja.nome_fantasia}">
            //     <div class="store-info">
            //         <strong>${loja.nome_fantasia}</strong>
            //         <span>${item.distancia_km} km</span>
            //     </div>
            // `;
            div.innerHTML = `<img src="${loja.logo}" alt="${loja.nome_fantasia}">
                            <div class="store-info">
                                <strong>
                                    ${loja.nome_fantasia}
                                </strong>
                                <span>
                                    ⭐ ${'4.9'} • ${'Brasileira'} • ${item.distancia_km}km
                                </span>
                                <span>
                                ${'store.time'} • ${'store.price'}
                                </span>
                            </div>`;
            storeList.appendChild(div);
        });
    }



    window.initAutocomplete = initAutocomplete;
});

