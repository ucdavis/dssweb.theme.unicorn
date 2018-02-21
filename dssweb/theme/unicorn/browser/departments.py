from Products.CMFCore.utils import getToolByName
from Products.Five.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.collection import collection
from Acquisition import aq_inner
from zope.component import getMultiAdapter 
 
    
class DeptNamesView(BrowserView):
    
    """methods to get department for address"""  
    def __init__(self, context, request):
        super(DeptNamesView, self).__init__(context, request)
        portal_state = getMultiAdapter((self.context, self.request),
            name=u"plone_portal_state")
        self.portal_url = portal_state.portal_url()
        self.nav_url = portal_state.navigation_root_url()
        self.catalog = getToolByName(context, 'portal_catalog') 
    
    def getObjectByUID(self, UID):
        """
            find the object with this UID
        """
        catalog = getToolByName(self, 'portal_catalog')
        brains = catalog(UID=UID)
        return brains[0].getObject()

    def getQueryDepartment(self):
        #target_collection = self.collection()
        results = self.context.getRawQuery()
        for s in results:
            if 'getRawDepartments' in s['i']:
                dept_uid = s['v']
                if dept_uid:
                    return self.getObjectByUID(dept_uid)
                return None
    