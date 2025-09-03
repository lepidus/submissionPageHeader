import '../support/commands.js';

function beginSubmission(submissionData) {
    cy.get('input[name="locale"][value="en"]').click();
    cy.setTinyMceContent('startSubmission-title-control', submissionData.title);
	cy.contains('span', submissionData.section).parent().within(() => {
		cy.get('input[type="radio"]').check();
	});
    cy.get('input[name="submissionRequirements"]').check();
    cy.get('input[name="privacyConsent"]').check();

    cy.contains('button', 'Begin Submission').click();
}

function detailsStep(submissionData) {
    cy.setTinyMceContent('titleAbstract-abstract-control-en', submissionData.abstract);
    submissionData.keywords.forEach(keyword => {
        cy.get('#titleAbstract-keywords-control-en').type(keyword, {delay: 0});
        cy.get('#titleAbstract-keywords-control-en').type('{enter}', {delay: 0});
    });
    cy.contains('button', 'Continue').click();
}

function filesStep(submissionData) {
    cy.addSubmissionGalleys(submissionData.files);
    cy.contains('button', 'Continue').click();
}

describe("Better display of preprints's section", function () {
	let submissionData;

	before(function () {
		submissionData = {
			section: 'High Fantasy',
			title: 'Fire & Blood',
			abstract: 'Lorem ipsum dolor sit amet',
			keywords: ['dragons', 'Westeros'],
			files: [{
                'file': 'dummy.pdf',
                'fileName': 'design_aircraft_engines.pdf',
                'genre': Cypress.env('defaultGenre')
            }]
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
        beginSubmission(submissionData);
        detailsStep(submissionData);
        filesStep(submissionData);
        cy.contains('button', 'Continue').click();
        cy.contains('button', 'Continue').click();
        cy.contains('button', 'Submit').click();
        cy.get('.modal__panel:visible').within(() => {
            cy.contains('button', 'Submit').click();
        });
		cy.contains('Submission complete');
	});
    it('Preprint section is displayed at top of the page', function () {
        cy.login('dbarnes', null, 'publicknowledge');

        cy.findSubmission('active', submissionData.title);
        cy.get('.identificationSection').within(() => {
			cy.contains('strong', 'Section');
			cy.contains('span', 'High Fantasy');
		});
    });
});