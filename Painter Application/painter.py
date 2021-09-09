from kivy.app import App
from kivy.uix.label import Label
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen, FadeTransition
from kivy.uix.widget import Widget
from kivy.graphics import Line, Color, InstructionGroup
from kivy.uix.image import Image
from kivy.properties import NumericProperty
from kivy.core.image import Image as CoreImage
from kivy.uix.behaviors import ButtonBehavior
from kivy.properties import ObjectProperty, ListProperty
from kivy.uix.slider import Slider


class Painter(Widget):
    undolist=[]
    objects = []
    drawing = False
    LineWidth = 5
    LineColor = ListProperty([0,0,0,1])
    def on_touch_up(self, touch):
        self.drawing = False

    def on_touch_move(self, touch):
        if self.drawing:
            self.points.append(touch.pos)
            self.obj.children[-1].points = self.points
        else:
            self.drawing = True
            self.points = [touch.pos]
            self.obj = InstructionGroup()
            self.obj.add(Color(rgba=self.LineColor))
            self.obj.add(Line(width=self.LineWidth))
            self.objects.append(self.obj)
            self.canvas.add(self.obj)
    def undo(self):
        if len(self.objects)==0:
            None
        else:
            item = self.objects.pop(-1)
            self.undolist.append(item)
            self.canvas.remove(item)
        
    def redo(self):
        if len(self.undolist)==0:
            None
        else:
            item = self.undolist.pop(-1)
            self.objects.append(item)
            self.canvas.add(item)
        
class ImageButton(ButtonBehavior, Image):
    ScreenManager = ObjectProperty()
    def on_press(self, *args):
        pass

                    
class MainScreen(Screen):
    pass

class AnotherScreen(Screen):
    pass

class ScreenManagement(ScreenManager):
    pass

class Palet(Widget):
    pass    


presentation = Builder.load_file("main.kv")

        
class MainApp(App):
    def build(self):
        return presentation

if __name__ == "__main__":
    MainApp().run()
