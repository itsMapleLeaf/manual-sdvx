from CommonClient import CommonContext, ClientCommandProcessor

class TrackerGameContext(CommonContext):
    def set_callback(self, callback_func): ...
    def set_events_callback(self, events_callback): ...

TrackerCommandProcessor = ClientCommandProcessor
