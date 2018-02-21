# -*- coding: utf-8 -*-
"""view to unify api for folder, old-style collection and new-style collection

also supports using as the view for a faceted navigation view

faceted nav returns Products.CMFPlone Batches of catalog brains
new collections return plone.batching Batches of plone.app.contentlisting objects
folders return Products.CMFPlone Batches of catalog brains
old collections return Products.CMFPlone Batches of catalog brains
"""
from Products.Five.browser import BrowserView


class UnifiedContentMixin(object):
    """This mixin provides a unified api call for getting objects in a location

    it is intended to work with ATFolder, ATTopic and plone.app.collection types
    """

    def query(self, **kwargs):
        """pass call through to individual implementations

        As this is supposed to work also with eea.facetednavigation, we need to
        mock the api provided by the query view for that product, which is
        responsible for returning batch of search/navigation results.
        """
        return self._results(**kwargs)

    def _results(self, **kwargs):
        """subclasses must implement this method"""
        raise NotImplementedError()


class FolderUnifiedView(UnifiedContentMixin, BrowserView):
    """wrapper for unified view api around an ATFolder"""

    def _results(self, batch=True, b_start=0, b_size=0, sort_on=None, brains=False, custom_query={}):
        """mimic call pattern in folder_listing.pt from Products.CMFPlone

        return value is a Products.CMFPlone batch of brains
        """
        results = self.context.getFolderContents(
            custom_query, batch=True, b_size=b_size or 40
        )
        return results


class CollectionUnifiedView(UnifiedContentMixin, BrowserView):
    """wrapper for unified view api around a plone.app.collecitons collection
    """

    def _results(self, batch=True, b_start=0, b_size=0, sort_on=None, brains=False, custom_query={}):
        """mimic call to collection.results in plone.app.collection

        return value is a plone.batching Batch of contentlisting items
        """
        kwargs = locals().copy()
        do_not_pass = ['self']
        keys = kwargs.keys()
        kwargs = {k: kwargs[k] for k in keys if k not in do_not_pass and kwargs[k]}

        return self.context.results(**kwargs)
        
        


# is this really required?  It appears impossible to build an old-style
# collection of events
class TopicUnifiedView(UnifiedContentMixin, BrowserView):
    """wrapper for unified view api around an ATTopic"""

    def _results(self, batch=True, b_start=0, b_size=0, sort_on=None, brains=False, custom_query={}):
        return []
