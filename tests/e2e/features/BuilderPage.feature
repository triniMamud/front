Feature: Demo page

  Show a Demo page

  @admin
  Scenario: Show the Demo page content
    Given Page URI is /promotions/builder
    When Browser navigates
    Then Browser is in expected page URI
    And Page structure is loaded
    And It should show 'Create promotion' title
