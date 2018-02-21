# -*- coding: utf-8 -*-

from Acquisition import aq_inner
from plone.app.contentlisting.interfaces import IContentListing
from plone.app.layout.navigation.interfaces import INavigationRoot
from plone.app.search.browser import Search as PloneSearch
from Products.CMFCore.utils import getToolByName
from Products.CMFPlone.PloneBatch import Batch
from Products.ZCTextIndex.ParseTree import ParseError
from zope.component import getMultiAdapter

import re


def scoreCmp(a, b):
    return cmp(b.data_record_normalized_score_, a.data_record_normalized_score_)


def dateCmp(a, b):
    return cmp(b.Date, a.Date)


def titleCmp(a, b):
    return cmp(a.Title.lower(), b.Title.lower())


class Search(PloneSearch):
    """ Override plone.app.search Search
    """

    def __init__(self, context, request):
        super(Search, self).__init__(context, request)
        self.portal_state = getMultiAdapter((self.context, self.request),
            name=u"plone_portal_state")
        self.portal_url = self.portal_state.portal_url()
        self.nav_url = self.portal_state.navigation_root_url()
        self.in_sub_site = self.portal_url != self.nav_url

    def departmentsQuery(self):
        """
            return a getRawDepartments query term for the current
            subsite.
            If this turns out to be too expensive, we can use a
            volatile ram cache for this.
        """

        context = self.context

        # get our FSD, which must be 'people' in the portal root
        fsd = getattr(self.portal_state.portal(), 'people', None)
        if fsd is None:
            return None

        # get our list of search departments;
        # either from an explicit search_departments property on the
        # subsite object, or from the subsite id.
        subsite = self.portal_state.navigation_root()
        search_departments = getattr(aq_inner(subsite), 'search_departments', None)
        if search_departments is None:
            search_departments = [subsite.getPhysicalPath()[-1]]

        # get the UIDs for our departments
        duids = []
        for d_id in search_departments:
            fsd_department = getattr(context.people, d_id, None)
            if fsd_department is not None:
                duids.append(fsd_department.UID())
        if not duids:
            return None

        # contruct our subquery
        query = {}
        query['path'] = '/'.join(fsd.getPhysicalPath())
        query['portal_type'] = ['FSDPerson']
        query['getRawDepartments'] = {
            'query': duids,
            'operator': 'or',
            }
        return query

    def results(self, query=None, batch=True, b_size=10, b_start=0):
        """
            Customize Plone's search to include people from the root FSD
            when searching in a departmental subsite.
        """

        if query is None:
            query = {}
        if batch:
            query['b_start'] = b_start = int(b_start)
            query['b_size'] = b_size# -*- coding: utf-8 -*-

from Acquisition import aq_inner
from plone.app.contentlisting.interfaces import IContentListing
from plone.app.layout.navigation.interfaces import INavigationRoot
from plone.app.search.browser import Search as PloneSearch
from Products.CMFCore.utils import getToolByName
from Products.CMFPlone.PloneBatch import Batch
from Products.ZCTextIndex.ParseTree import ParseError
from zope.component import getMultiAdapter

import re


def scoreCmp(a, b):
    return cmp(b.data_record_normalized_score_, a.data_record_normalized_score_)


def dateCmp(a, b):
    return cmp(b.Date, a.Date)


def titleCmp(a, b):
    return cmp(a.Title.lower(), b.Title.lower())


class Search(PloneSearch):
    """ Override plone.app.search Search
    """

    def __init__(self, context, request):
        super(Search, self).__init__(context, request)
        self.portal_state = getMultiAdapter((self.context, self.request),
            name=u"plone_portal_state")
        self.portal_url = self.portal_state.portal_url()
        self.nav_url = self.portal_state.navigation_root_url()
        self.in_sub_site = self.portal_url != self.nav_url

    def departmentsQuery(self):
        """
            return a getRawDepartments query term for the current
            subsite.
            If this turns out to be too expensive, we can use a
            volatile ram cache for this.
        """

        context = self.context

        # get our FSD, which must be 'people' in the portal root
        fsd = getattr(self.portal_state.portal(), 'people', None)
        if fsd is None:
            return None

        # get our list of search departments;
        # either from an explicit search_departments property on the
        # subsite object, or from the subsite id.
        subsite = self.portal_state.navigation_root()
        search_departments = getattr(aq_inner(subsite), 'search_departments', None)
        if search_departments is None:
            search_departments = [subsite.getPhysicalPath()[-1]]

        # get the UIDs for our departments
        duids = []
        for d_id in search_departments:
            fsd_department = getattr(context.people, d_id, None)
            if fsd_department is not None:
                duids.append(fsd_department.UID())
        if not duids:
            return None

        # contruct our subquery
        query = {}
        query['path'] = '/'.join(fsd.getPhysicalPath())
        query['portal_type'] = ['FSDPerson']
        query['getRawDepartments'] = {
            'query': duids,
            'operator': 'or',
            }
        return query

    def results(self, query=None, batch=True, b_size=10, b_start=0):
        """
            Customize Plone's search to include people from the root FSD
            when searching in a departmental subsite.
        """

        if query is None:
            query = {}
        if batch:
            query['b_start'] = b_start = int(b_start)
            query['b_size'] = b_size
        query = self.filter_query(query)

        if query is None:
            results = []
        else:
            catalog = getToolByName(self.context, 'portal_catalog')
            try:
                results = catalog(**query)
                if query['path'] and 'FSDPerson' in query['portal_type']:
                    # we're in a subsite/section and people are allowed
                    # in the results.
                    people_query = self.departmentsQuery()
                    if people_query:
                        query.update(people_query)
                        results = results + catalog(**query)

                        # set sorting method.
                        sort_on = query.get('sort_on')
                        if sort_on == 'sortable_title':
                            sort_cmp = titleCmp
                        elif sort_on == 'Date':
                            sort_cmp = dateCmp
                        else:
                            sort_cmp = scoreCmp

                        # note that our results will no longer
                        # be lazy after the next step. there
                        # may be efficiency implications
                        results = sorted(results, sort_cmp)
            except ParseError:
                return []

        results = IContentListing(results)
        if batch:
            results = Batch(results, b_size, b_start)
        return results

    def navRootRelativeUrl(self, url):
        """
            Return a URL that has been adjusted to traverse
            to the object by acquisition via the nav root.
        """

        if self.in_sub_site:
            url = url.replace(self.portal_url, self.nav_url)
        return url

    def breadcrumbs(self, item):
        """
            Custom breadcrumbs to localize people
        """

        crumbs = super(Search, self).breadcrumbs(item)
        if self.in_sub_site and crumbs:
            last_crumb = crumbs[-1]
            last_crumb['absolute_url'] = self.navRootRelativeUrl(re.sub(
                r"/people$",
                '/directory-of-people',
                last_crumb['absolute_url']
                ))
        return crumbs
        query = self.filter_query(query)

        if query is None:
            results = []
        else:
            catalog = getToolByName(self.context, 'portal_catalog')
            try:
                results = catalog(**query)
                if query['path'] and 'FSDPerson' in query['portal_type']:
                    # we're in a subsite/section and people are allowed
                    # in the results.
                    people_query = self.departmentsQuery()
                    if people_query:
                        query.update(people_query)
                        results = results + catalog(**query)

                        # set sorting method.
                        sort_on = query.get('sort_on')
                        if sort_on == 'sortable_title':
                            sort_cmp = titleCmp
                        elif sort_on == 'Date':
                            sort_cmp = dateCmp
                        else:
                            sort_cmp = scoreCmp

                        # note that our results will no longer
                        # be lazy after the next step. there
                        # may be efficiency implications
                        results = sorted(results, sort_cmp)
            except ParseError:
                return []

        results = IContentListing(results)
        if batch:
            results = Batch(results, b_size, b_start)
        return results

    def navRootRelativeUrl(self, url):
        """
            Return a URL that has been adjusted to traverse
            to the object by acquisition via the nav root.
        """

        if self.in_sub_site:
            url = url.replace(self.portal_url, self.nav_url)
        return url

    def breadcrumbs(self, item):
        """
            Custom breadcrumbs to localize people
        """

        crumbs = super(Search, self).breadcrumbs(item)
        if self.in_sub_site and crumbs:
            last_crumb = crumbs[-1]
            last_crumb['absolute_url'] = self.navRootRelativeUrl(re.sub(
                r"/people$",
                '/directory-of-people',
                last_crumb['absolute_url']
                ))
        return crumbs
