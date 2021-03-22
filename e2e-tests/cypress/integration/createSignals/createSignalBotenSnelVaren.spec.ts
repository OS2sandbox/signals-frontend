import { BOTEN } from '../../support/selectorsCreateSignal';
import { MANAGE_SIGNALS } from '../../support/selectorsManageIncidents';
import questions from '../../fixtures/questions/questions.json';
import { generateToken } from '../../support/jwt';
import signal from '../../fixtures/signals/botenSnelVaren.json';
import * as routes from '../../support/commandsRouting';
import * as createSignal from '../../support/commandsCreateSignal';

describe('Create signal category "Boten snel varen"', () => {
  describe('Create signal boten', () => {
    before(() => {
      routes.postSignalRoutePublic();
      routes.stubPreviewMap();
      routes.stubMap();
      cy.visit('incident/beschrijf');
    });

    it('Should create the signal', () => {
      createSignal.setDescriptionPage(signal);
      cy.contains('Volgende').click();

      createSignal.checkSpecificInformationPage(signal);
      cy.contains(questions.overlastOpHetWater.extra_boten_snelheid_typeboot.label).should('be.visible');
      cy.get(BOTEN.radioButtonPlezierVaart).check({ force: true }).should('be.checked');
      cy.get(BOTEN.inputNaamRederij).should('not.exist');
      cy.get(BOTEN.radioButtonVrachtschip).check({ force: true }).should('be.checked');
      cy.get(BOTEN.inputNaamRederij).should('not.exist');
      cy.get(BOTEN.radioButtonOverig).check({ force: true }).should('be.checked');
      cy.get(BOTEN.inputNaamRederij).should('not.exist');
      cy.get(BOTEN.radioButtonRondvaartboot).check({ force: true }).should('be.checked');
      cy.get(BOTEN.inputNaamRederij).should('be.visible').type('Amsterdam Boat Center');
      cy.contains(questions.overlastOpHetWater.extra_boten_snelheid_rederij.label).should('be.visible');
      cy.contains(questions.overlastOpHetWater.extra_boten_snelheid_naamboot.label).should('be.visible');
      cy.get(BOTEN.inputNaamBoot).should('be.visible').type('Bota Fogo');
      cy.contains(questions.overlastOpHetWater.extra_boten_snelheid_meer.label).should('be.visible');
      cy.contains(questions.overlastOpHetWater.extra_boten_snelheid_meer.subtitle).should('be.visible');
      cy.get(BOTEN.inputNogMeer).type('De boot voer richting Ouderkerk aan de Amstel');
      cy.contains('Volgende').click();

      createSignal.setPhonenumber(signal);
      cy.contains('Volgende').click();

      createSignal.setEmailAddress(signal);
      cy.contains('Volgende').click();

      createSignal.checkSummaryPage(signal);
      cy.contains('Verstuur').click();
      cy.wait('@postSignalPublic');
      cy.get(MANAGE_SIGNALS.spinner).should('not.exist');

      createSignal.checkThanksPage();
      createSignal.saveSignalId();
    });
  });
  describe('Check data created signal', () => {
    before(() => {
      localStorage.setItem('accessToken', generateToken('Admin', 'signals.admin@example.com'));
      routes.getManageSignalsRoutes();
      routes.getSignalDetailsRoutesById();
      cy.visit('/manage/incidents/');
      routes.waitForManageSignalsRoutes();
    });

    it('Should show the signal details', () => {
      routes.stubPreviewMap();
      createSignal.openCreatedSignal();
      routes.waitForSignalDetailsRoutes();

      createSignal.checkAllDetails(signal);
    });
  });
});
