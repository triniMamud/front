const { Then } = require('cucumber');

Then("It should show '{section}' section", (section) => {
  browser.element(`.${section}`).waitForExist();
});