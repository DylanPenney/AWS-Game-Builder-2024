class Horse:
    def __init__(self, _name, _lane):
        self.name = _name
        self.lane = _lane
        self.y_position = 0
        self.progress = 0

    def __str__(self):
        return self.name

    def move(self, distance):
        self.y_position += distance
        self.progress += distance