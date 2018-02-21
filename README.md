dssweb.theme.unicorn
==================

Skins for the dss Web Remodel Project

Search
======

Also includes a customized search that returns the FSD persons in the department as well as items in the subsite.

Assumptions built into the custom search:

  * The FSD must have the id "people" and be in the portal root.

  * the subsite's id (e.g., psychology) must match the department's id in FSD --
    OR there must be a "search_departments" list attribute of the subsite object
    that lists all the FSD departments to search.

  * the FacNav people search for the subsite must have the id "directory-of-people"
    for proper URL fixups.

The search_departments list attribute may be added via manage_propertiesForm as a
"lines" property.