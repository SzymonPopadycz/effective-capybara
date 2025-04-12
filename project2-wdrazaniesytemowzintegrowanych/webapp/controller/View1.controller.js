sap.ui.define([ 
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (Controller, Fragment, MessageToast, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit() {
            let oAlcoholsModel = new JSONModel();
            oAlcoholsModel.loadData("model/mockdata.json"); // Ładujemy dane z pliku mockdata.json
            this.getView().setModel(oAlcoholsModel, "Alcohols");
        },

        onAlcoholPress: function (oEvent) {
            let oItem = oEvent.getParameter("listItem");
            let oContext = oItem.getBindingContext("Alcohols");
            let sPath = oContext.getPath();
            let sAlcoholID = this.getView().getModel("Alcohols").getProperty(sPath).id;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("Detail", {alcoholID: sAlcoholID});
        },

        onInputLiveChange: function (oEvent) {
            let oInput = oEvent.getSource(),
                sValue = oInput.getValue()
                

            if (oInput.getId() === this.createId("phoneInput")) {
                if (!phonePattern.test(sValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Invalid phone number format. Use format 123-456-789.");
                } else {
                    oInput.setValueState("None");
                }
            }

            if (oInput.getId() === this.createId("emailInput")) {
                if (!emailPattern.test(sValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Invalid email format.");
                } else {
                    oInput.setValueState("None");
                }
            }
        },

        onAddAlcohol: function () {
            let oView = this.getView();

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragment.AddAlcohol",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onSaveAlcohol: function () {
            let oView = this.getView(),
                oModel = oView.getModel('Alcohols'),
                aAlcohols = oModel.getData().Alcohols;

            let sName = oView.byId("nameInput").getValue(),
                sType = oView.byId("typeInput").getValue(),
                sCountry = oView.byId("countryInput").getValue(),
                sDescription = oView.byId("descriptionInput").getValue(),
                sAge = oView.byId("ageInput").getValue();

            if (!sName || !sType || !sCountry) {
                MessageToast.show("Please fill in required fields.");
                return;
            }

            let newAlcohol = {
                "id": (aAlcohols.length + 1).toString(),
                "name": sName,
                "type": sType,
                "age": parseInt(sAge, 10),
                "country": sCountry,
                "description": sDescription
            };

            aAlcohols.push(newAlcohol);
            oModel.setProperty("/Alcohols", aAlcohols);

            MessageToast.show("Alcohol added!");
            this._clearForm();
            this.onCancelAlcohol();
        },

        onCancelAlcohol: function () {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
            this._clearForm();
        },

        _clearForm: function () {
            let oView = this.getView(),
                aInputs = [
                    "nameInput",
                    "typeInput",
                    "countryInput",
                    "descriptionInput",
                    "ageInput"
                ];

            aInputs.forEach(function (sInputId) {
                let oInput = oView.byId(sInputId);
                if (oInput) {
                    oInput.setValue("");
                    oInput.setValueState("None");
                }
            });
        },

        onDeleteAlcohol: function () {
            let oTable = this.getView().byId("table"),
                aSelectedItems = oTable.getSelectedItems(); // Zwraca tablicę zaznaczonych elementów

            // Pobieramy model z listą alkoholi
            let oModel = this.getView().getModel("Alcohols");
            let aAlcohols = oModel.getProperty("/Alcohols");

            // Usuwamy alkohole na podstawie zaznaczonego indeksu
            aSelectedItems.forEach(function (oItem) {
                let oContext = oItem.getBindingContext("Alcohols");
                let sAlcoholID = oContext.getProperty("id"); // Pobieramy ID alkoholu
                let iIndex = aAlcohols.findIndex(alcohol => alcohol.id === sAlcoholID);
                if (iIndex !== -1) {
                    aAlcohols.splice(iIndex, 1); // Usuwamy alkohol
                }
            });

            // Aktualizujemy model
            oModel.setProperty("/Alcohols", aAlcohols);

            // Wyczyść wybór w tabeli
            oTable.removeSelections(true);

            this.getView().byId("removeAlcoholBtn").setEnabled(false);

            MessageToast.show("Alcohol deleted successfully.");
        },

        onItemSelected: function () {
            let oTable = this.getView().byId("table"),
                oRemoveButton = this.getView().byId("removeAlcoholBtn"),
                aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length > 0) {
                oRemoveButton.setEnabled(true);
            } else {
                oRemoveButton.setEnabled(false);
            }
        },

        onFilterChange: function () {
            let oView = this.getView(),
                oTable = oView.byId("table"),
                sName = oView.byId("idNameInput").getValue(),
                sType = oView.byId("idTypeInput").getValue(),
                sCountry = oView.byId("idCountryInput").getValue(),
                aFilters = [];

            // Tworzenie filtrów na podstawie wartości wprowadzonych przez użytkownika
            if (sName) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sName));
            }

            if (sType) {
                aFilters.push(new Filter("type", FilterOperator.Contains, sType));
            }

            if (sCountry) {
                aFilters.push(new Filter("country", FilterOperator.Contains, sCountry));
            }

            let oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        }
    });
});