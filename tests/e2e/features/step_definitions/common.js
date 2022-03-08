const { Given, When, Then } = require('cucumber');

Given('Page URI is {uri}', function(uri) {
  this.requestedURI = uri;
});

When('Browser navigates', function() {
  browser.url(this.requestedURI);
});

Then('Browser is in expected page URI', function() {
  expect(browser.getUrl()).to.equal(`${browser.options.baseUrl}${this.requestedURI}`);
});

Then('Page structure is loaded', () => {
  browser.element('.odin-wrapper').waitForExist(2000);
});

Then("It should show '{title}' title", (title) => {
  expect(browser.getTitle()).to.equal(title);
});
