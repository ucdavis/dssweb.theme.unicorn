import logging

from Products.Archetypes.public import Schema
from Products.Archetypes.public import StringField
from Products.Archetypes.public import StringWidget
from Products.Archetypes.public import SelectionWidget

from eea.facetednavigation import EEAMessageFactory as _
from eea.facetednavigation.widgets import ViewPageTemplateFile
from eea.facetednavigation.widgets.daterange.widget import formated_time
from eea.facetednavigation.widgets.widget import Widget as AbstractWidget


logger = logging.getLogger('dssweb.theme.unicorn.datepicker')


EditSchema = Schema((
    StringField(
        'index',
        schemata="default",
        required=True,
        vocabulary_factory='eea.faceted.vocabularies.DateRangeCatalogIndexes',
        widget=SelectionWidget(
            label=_(u'Catalog index'),
            description=_(u'Catalog index to use for search'),
            i18n_domain="eea"
        )
    ),
    StringField(
        'default',
        schemata="default",
        widget=StringWidget(
            size=25,
            label=_(u'Default value'),
            description=_(u'Default string to search for'),
            i18n_domain="eea"
        )
    ),
))


def ensure_date_format(date_input):
    """ensure that the input str date is in the format YYYY-MM-DD"""
    date = ''
    if date_input:
        clean = date_input.replace('/', '-')
        try:
            parts = map(int, clean.split('-'))
        except ValueError:
            pass
        if len(parts) == 3:
            date = "{:0>4d}-{:0>2d}-{:0>2d}".format(*parts)
    return date


class Widget(AbstractWidget):
    widget_type = 'datepicker'
    widget_label = _(u'Date Picker')
    view_js = '++resource++dssweb.theme.unicorn.datepicker.view.js'
    edit_js = '++resource++dssweb.theme.unicorn.datepicker.edit.js'
    view_css = '++resource++dssweb.theme.unicorn.datepicker.view.css'

    index = ViewPageTemplateFile('widget.pt')
    edit_schema = AbstractWidget.edit_schema.copy() + EditSchema

    def query(self, form):
        """ Get value from form and return a catalog dict query
        """
        query = {}
        index = self.data.get('index', '')
        index = index.encode('utf-8', 'replace')
        if not index:
            return query

        if self.hidden:
            value = self.default
        else:
            value = form.get(self.data.getId(), None)
            if value is None:
                return query

        start = ensure_date_format(value)
        if not start:
            return query

        try:
            start = formated_time(start)
        except Exception as err:
            logger.exception(err)
            return query

        start = start - 1
        start = start.latestTime()

        query[index] = {
            'query': start,
            'range': 'min'
        }
        return query

