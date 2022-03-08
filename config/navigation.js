const { AiOutlineClockCircle, AiOutlineTag, AiOutlineQuestionCircle, AiOutlineStop } = require('react-icons/ai');
const Megaphone = require('../app/components/icons/megaphone');
const { getMenuNavigation } = require('../services/navigation');
const { navigation } = require('./default');

/**
 * Get icon
 */
const getIconById = id => {
  const components = {
    faclock: AiOutlineClockCircle,
    fatag: AiOutlineTag,
    faquestioncircle: AiOutlineQuestionCircle,
    faban: AiOutlineStop,
    FaRegObjectGroup: Megaphone,
  };

  return components[id];
};

/**
 * Get items
 */
const getItems = menu => {
  const itemsList = [];
  menu.map(({ id, label, icon, link, permissions, expanded, items, close }) =>
    link
      ? itemsList.push({
          id,
          label,
          icon: getIconById(icon),
          link,
          permissions,
          expanded,
        })
      : itemsList.push({
          id,
          label,
          icon: getIconById(icon),
          permissions,
          expanded,
          items,
          close,
        }),
  );
  return itemsList;
};

/**
 * Menu structure
 */
const getMenuStructure = ({ closed, expanded, menu }) => {
  const tree = {
    closed,
    expanded,
    menu: getItems(menu),
  };
  return tree;
};

/**
 * Layout Navigation config
 */
module.exports = async req => {
  try {
    const resolvedNavigation = await getMenuNavigation(req);
    return getMenuStructure(resolvedNavigation);
  } catch (e) {
    return getMenuStructure(navigation);
  }
};
