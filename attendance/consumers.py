import json

from channels.generic.websocket import AsyncWebsocketConsumer



class AttendanceStatusUpdate(AsyncWebsocketConsumer):
    async def connect(self):
        self.attendance_group_name = "attendance_status_group"
        # join group
        await self.channel_layer.group_add(self.attendance_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # leave group
        await self.channel_layer.group_discard(self.attendance_group_name, self.channel_name)

    # receive attendance status update from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        attendance_id = text_data_json["attendanceID"]
        attendance_status = text_data_json["attendanceStatus"]
        transmitting_user = self.scope["user"]

        # send attendance status update to group
        await self.channel_layer.group_send(self.attendance_group_name, {
            "type": "attendance_status_group_message",
            "transmittingUser": transmitting_user.id,
            "attendanceID": attendance_id,
            "attendanceStatus": attendance_status,
            })

    # receive attendance status update from group
    async def attendance_status_group_message(self, event):
        attendance_id = event["attendanceID"]
        attendance_status = event["attendanceStatus"]
        transmitting_user = event["transmittingUser"]

        # send attendance status update to JS in page
        await self.send(text_data=json.dumps({
            "attendanceID": attendance_id,
            "attendanceStatus": attendance_status,
            "transmittingUser": transmitting_user,
            }))
