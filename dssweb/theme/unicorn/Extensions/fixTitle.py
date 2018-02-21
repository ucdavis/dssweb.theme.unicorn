import re

def fixEventTitleString(self,strid,target):
   folder = target
   cleanString = re.sub('\W+','-',strid)
   if folder.has_key(cleanString):
       newString = "%s-%s" % (cleanString,'1')
       if folder.has_key(newString):
           thirdTry = "%s-%s" % (newString,'2')
           return thirdTry
       return newString
   else:
       return cleanString
