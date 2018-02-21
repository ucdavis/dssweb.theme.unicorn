"""
    Support for banner images.

    This is a view named @@banner-image, registered for *.

    Strategy:
        Looks for folder with id "top-images" in current folder;
        If it finds it, gets a list of images inside.
        Redirects to random choice.

        If not top-image, looks for "top-image" (singular) object.
        If found, redirects to it.

        If neither for those works, we look for a 'default_wall' property on the subsite.  If that is blank the theme defaults to ++theme++dssweb.theme.unicorn/images/banners/rec_blue_shadow.gif
"""
from Acquisition import aq_inner
from plone.memoize.view import memoize
from Products.CMFCore.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter

import random

#  This will have the portal url added on front
DEFAULT_WALL = '/++theme++dssweb.theme.unicorn/images/banners/rec_blue_shadow.gif'

class BannerImage(BrowserView):

    @memoize
    def defaultWall(self):
        self.portal_state = getMultiAdapter((self.context, self.request),
            name=u"plone_portal_state")
        subsite = self.portal_state.navigation_root()
        defaultWall = getattr(aq_inner(subsite), 'default_wall', None)
        if defaultWall is None:
            defaultWall = DEFAULT_WALL
        return defaultWall
    
    def findImageURL(self):
        context = self.context
        request = self.request

        # if not folderish, climb tree until so
        while not getMultiAdapter((context, request), name=u'plone_context_state').is_folderish():
            context = context.aq_parent

        image_folder = getattr(context.aq_explicit, 'top-images', None)
        if image_folder is not None:
            catalog = getToolByName(context, 'portal_catalog')
            folder_path = '/'.join(image_folder.getPhysicalPath())
            results = catalog(
                path={'query': folder_path, 'depth': 1},
                portal_type='Image',
                )
            if results:
                return random.choice(results).getURL()

        image = getattr(context.aq_explicit, 'top-image', None)
        if image is not None:
            return image.absolute_url()
        return None
        

    def wallpaperURL(self):
        portal_state = getMultiAdapter((self.context, self.request), name=u'plone_portal_state')
        image_url = self.findImageURL()
        if image_url is None:
            return portal_state.portal_url() + self.defaultWall()
        else:
            return image_url
    
    
    def bodyStyle(self):
        if self.findImageURL() is not None:
            return 'has-shadow-am'
        return ''
        
    def divStyle(self):
        if self.findImageURL() is not None:
            return 'wall shadow-am-graphic'
        return 'wall shadow-graphic'

    def contentId(self):
        if self.findImageURL() is not None:
            return 'am-content'
        return ''

    def __call__(self):
        context = self.context
        request = self.request
        portal_state = getMultiAdapter((context, request), name=u'plone_portal_state')

        image_url = self.findImageURL()
        if image_url is None:
            self.request.response.redirect(portal_state.portal_url() + self.defaultWall())
        else:
            self.request.response.redirect(image_url)
        return None