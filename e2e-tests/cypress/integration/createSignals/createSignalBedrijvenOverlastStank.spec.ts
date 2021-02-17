import { BEDRIJVEN_HORECA, STANK_OVERLAST } from '../../support/selectorsCreateSignal';
import { MANAGE_SIGNALS } from '../../support/selectorsManageIncidents';
import questions from '../../fixtures/questions/questions.json';
import { generateToken } from '../../support/jwt';
import signal from '../../fixtures/signals/bedrijvenStank.json';
import * as routes from '../../support/commandsRouting';
import * as createSignal from '../../support/commandsCreateSignal';

describe('Create signal "Bedrijven overlast stank" and check signal details', () => {
  describe('Create signal overlast stank', () => {
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

      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_wat.label).should('be.visible');
      cy.get(BEDRIJVEN_HORECA.radioButtonAnderBedrijf).click({ force: true });
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_naam.label).should('be.visible');
      cy.get(BEDRIJVEN_HORECA.inputWieWat).eq(0).type('Klanten van de sportsschool');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_adres.label).should('be.visible');
      cy.get(BEDRIJVEN_HORECA.inputAdres).eq(1).type('Op de Klapperweg nummer 39');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank.label).should('be.visible');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank.subtitle).should('be.visible');
      cy.get(STANK_OVERLAST.inputGeur).eq(2).type('Een zeer indringende zweetgeur');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank_oorzaak.label).should('be.visible');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank_oorzaak.subtitle).should('be.visible');
      cy.get(STANK_OVERLAST.inputOorzaakGeur)
        .eq(3)
        .type('Klanten van de sportschool die voor de deur staan te sporten, maar ook binnen voor een open raam');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank_weer.label).should('be.visible');
      cy.get(STANK_OVERLAST.inputWeersomstandigheden).eq(4).type('Het is erg warm buiten, de zon schijnt volop');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_stank_ramen.label).should('be.visible');
      cy.get(STANK_OVERLAST.radioButtonRaamOpen).click({ force: true });
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_vaker.label).should('be.visible');
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_vaker.subtitle).should('be.visible');
      cy.get(BEDRIJVEN_HORECA.radioButtonVakerNee).click({ force: true });
      cy.contains(questions.overlastBedrijvenEnHoreca.extra_bedrijven_horeca_caution.answers).should('be.visible');

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
