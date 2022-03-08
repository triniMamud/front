const { When } = require('cucumber');

When("Click on '{item}' menu item", function(item) {
  browser.element(`#menuItem_${item}`).click();
});