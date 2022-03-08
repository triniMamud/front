Feature: Navigation

  Check navigation trough Sidebar

  Background: Load page
    Given Page URI is /
    When Browser navigates

  Scenario Outline: Navigate to menu item
    When Click on '<item>' menu item
    Then Page structure is loaded
    And It should show '<title>' title

  Examples:
    | item         | title                  |
    | list         | Create promotion       |
    | builder      | Create promotion       |
