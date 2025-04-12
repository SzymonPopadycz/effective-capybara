sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.Detail", {

        onInit: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
        
            const oEditModel = new JSONModel({ editMode: false });
            this.getView().setModel(oEditModel, "editModel");

            const oModel = this.getOwnerComponent().getModel("Alcohols");
            oModel.attachRequestCompleted(() => {
                this._onObjectMatched(oEvent); // Przekaż oEvent albo przechowaj go
            });

        },

        _onObjectMatched: function (oEvent) {
            const sAlcoholID = oEvent.getParameter("arguments").alcoholID;
            const oModel = this.getOwnerComponent().getModel("Alcohols");
        
            if (!oModel.getProperty("/Alcohols")) {
                // Jeśli dane jeszcze się nie wczytały – czekamy
                oModel.attachRequestCompleted(() => {
                    this._bindAlcoholByID(sAlcoholID);
                });
            } else {
                this._bindAlcoholByID(sAlcoholID);
            }
        },
        
        _bindAlcoholByID: function (sAlcoholID) {
            const oModel = this.getOwnerComponent().getModel("Alcohols");
            const aAlcohols = oModel.getProperty("/Alcohols");
        
            const oAlcohol = aAlcohols.find(alcohol => alcohol.id === sAlcoholID);
        
            if (oAlcohol) {
                const oAlcoholModel = new JSONModel(oAlcohol);
                this.getView().setModel(oAlcoholModel, "alcoholModel");
            } else {
                console.warn(`Nie znaleziono alkoholu o ID: ${sAlcoholID}`);
            }
        },

        onBackPress: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
        },

        onEditPress: function () {
            this.getView().getModel("editModel").setProperty("/editMode", true);
        },

        onSavePress: function () {
            let oAlcoholModel = this.getView().getModel("alcoholModel"),
                oAlcoholData = oAlcoholModel.getData();

            // Zaktualizowanie danych w modelu "Alcohols"
            let oAlcoholsModel = this.getView().getModel("Alcohols"),
                aAlcohols = oAlcoholsModel.getProperty("/Alcohols");

            let iIndex = aAlcohols.findIndex(alcohol => alcohol.id === oAlcoholData.id);
            if (iIndex !== -1) {
                aAlcohols[iIndex] = oAlcoholData; // Aktualizacja danych
            }

            oAlcoholsModel.setProperty("/Alcohols", aAlcohols);

            this.getView().getModel("editModel").setProperty("/editMode", false);

            MessageToast.show("Alcohol details saved successfully.");
        },

        // Funkcja anulująca edycję
        onCancelPress: function () {
            // Przywrócenie początkowych danych alkoholu
            let oAlcoholModel = this.getView().getModel("alcoholModel"),
                oAlcoholData = oAlcoholModel.getData();

            // Ponownie ustawiamy dane w modelu, aby anulować zmiany
            let oModel = this.getView().getModel("Alcohols"),
                aAlcohols = oModel.getProperty("/Alcohols"),
                oOriginalAlcohol = aAlcohols.find(alcohol => alcohol.id === oAlcoholData.id);
            oAlcoholModel.setData(oOriginalAlcohol);

            this.getView().getModel("editModel").setProperty("/editMode", false);

            MessageToast.show("Changes canceled.");
        },

    });
});