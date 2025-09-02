import '../support/commands.js';

describe("Better display of preprints's section", function () {
	let submission;

	before(function () {
		submission = {
			section: 'High Fantasy',
			title: 'Fire & Blood',
			abstract: 'Lorem ipsum dolor sit amet',
			keywords: ['dragons', 'Westeros'],
		}
	});

	it('Moderator creates new section', function () {
		cy.login('dbarnes', null, 'publicknowledge');
		cy.contains('.app__navItem', 'Server').click();

		cy.contains('Server Settings');
		cy.get('#sections-button').click();
		
		cy.contains('a', 'Create Section').click();
		cy.wait(1000);
		cy.get('input[id^="title-en"').type('High Fantasy', { delay: 0 });
		cy.get('input[id^="abbrev-en"').type('hiFantasy', { delay: 0 });
		cy.get('input[id^="path"').type('hiFantasy', { delay: 0 });
		cy.get('#sectionForm button.submitFormButton').click();
		cy.wait(2000);

		cy.contains('.label', 'High Fantasy');
	});
	it('Author creates new submission', function () {
		cy.login('eostrom', null, 'publicknowledge');

		cy.get('div#myQueue a:contains("New Submission")').click();

        cy.get('select[id="sectionId"]').select(submission.section);
		cy.get('input[id^="checklist-"]').click({ multiple: true });
		cy.get('input[id=privacyConsent]').click();
		cy.get('button.submitFormButton').click();

		cy.waitJQuery();
        cy.get('#submitStep2Form button.submitFormButton').click();

		cy.get('input[id^="title-en_US-"').type(submission.title, { delay: 0 });
		cy.get('label').contains('Title').click();
		cy.get('textarea[id^="abstract-en_US-"').then((node) => {
			cy.setTinyMceContent(node.attr('id'), submission.abstract);
		});
		cy.get('ul[id^="en_US-keywords-"]').then((node) => {
			for(let keyword of submission.keywords) {
				node.tagit('createTag', keyword);
			}
		});
        cy.waitJQuery();
		cy.get('#submitStep3Form button.submitFormButton').click();

		cy.waitJQuery();
        cy.get('form[id=submitStep4Form] button:contains("Finish Submission")').click();
		cy.get('button.pkpModalConfirmButton').click();
		cy.waitJQuery();
		cy.get('h2:contains("Submission complete")');
	});
    it('Preprint section is displayed at top of the page', function () {
        cy.login('dbarnes', null, 'publicknowledge');

        cy.findSubmission('active', submission.title);
        cy.get('.identificationSection').within(() => {
			cy.contains('strong', 'Section');
			cy.contains('span', 'High Fantasy');
		});
    });
});