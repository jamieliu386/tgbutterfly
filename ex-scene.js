<!-- Graphics Example Code.  index.html - The web page document containing the canvas (drawing surface), that launches your javascript files.  By Garett //-->
<!DOCTYPE html> <html> <head> <meta charset="UTF-8"/> <link rel="icon" href="assets/fav.ico">
<script type="text/javascript" src="tinywebgl-ucla.js" ></script>  <!--  Javascript "include" files.  Any code in them gets executed as part of the page loading. //-->
<script type="text/javascript" src="dependencies.js"   ></script>
<script type="text/javascript"> "use strict"    
  window.onload = function init()        // ********************* THE ENTRY POINT OF THE WHOLE PROGRAM STARTS HERE ********************* 
    { window.contexts = {};                                                            // A global variable, "contexts".  Browsers support up to 16 WebGL contexts per page.
      document.getElementById( "canvases" ).appendChild( Object.assign( document.createElement( "canvas" ), { id: "main_canvas", width: 800, height: 600 } ) );
      const scenes  = [ "Butterfly_Scene", "Movement_Controls", "Global_Info_Table" ]; // Register some scenes to the "Canvas_Manager" object -- which WebGL calls
                                                                                       // upon every time a draw / keyboard / mouse event happens.  
                                                                                           
      Code_Manager.display_code( eval( scenes[0] ) );                                  // Display the code for our demo on the page, starting with the first scene in the list.
      for( let list of [ core_dependencies, all_dependencies ] )
      document.querySelector( "#class_list" ).rows[2].appendChild( Object.assign( document.createElement( "td" ), { 
        innerHTML: list.reduce( (acc, x) => acc += "<a href='javascript:void(0);' onclick='Code_Manager.display_code(" + x + ")'>" + x + "</a><br>", "" ) } ) );        
      document.getElementsByName( "main_demo_link" )[0].innerHTML = "<a href='javascript:void(0);' onclick='Code_Manager.display_code(" + scenes[0] + ")'>" + scenes[0] + "</a><br>";
      document.querySelector("#code_display").innerHTML = "Below is the code for the demo that's running:<br>&nbsp;<br>" + document.querySelector("#code_display").innerHTML;
      
      contexts[ "main_canvas" ] = new Canvas_Manager( "main_canvas", Color.of( 0.439216,0.576471,0.858824,1 ), scenes );   // Manage the WebGL canvas.  Second parameter sets background color.
      for( let c in contexts ) contexts[ c ].render();     // Call render() for each WebGL context on this page.  Then render() will re-queue itself for more calls.
    }
// Below is the demo you will see when you run the program!    
    
class Butterfly_Scene extends Scene_Component  // Code your butterfly assignment below.  It is an example of drawing a hierarchical object using a "model_transform" matrix.
{ constructor( context )
    { super( context );
      var shapes = { "box" :   new Cube(),                            // Load one of each of these shape definitions onto the GPU.  Once each Shape is there we 
                     "ball":   new Subdivision_Sphere( 4 ) };         // re-use it many times per display() call to get multiple of that shape to appear in the scene.
      this.submit_shapes( context, shapes );
                                                                      // Define the global camera and projection matrices.  
                                                                      // Arguments to perspective() are field of view, aspect ratio, near plane and far plane.
      Object.assign( context.globals.graphics_state, { camera_transform: Mat4.translation([ 0,-10,-40 ]), projection_transform: Mat4.perspective( Math.PI/4, context.width/context.height, .1, 1000 ) } );
      
      Object.assign( this, { hover: false, t: 0,                  // Define a couple of data members of a Butterfly_Scene.
                             yellow: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .3,  1 ), .2, 1, .7, 40 ),  // Call material() on the Phong_Shader,
                             brown:  context.get_instance( Phong_Model ).material( Color.of( .3, .3, .1,  1 ), .2, 1,  1, 40 ),  // which returns a special-made "material" 
                             red:    context.get_instance( Phong_Model ).material( Color.of(  1,  0,  0, .9 ), .1, .7, 1, 40 ),  // (a JavaScript object)
                             green:  context.get_instance( Phong_Model ).material( Color.of(  0, .5,  0,  1 ), .1, .7, 1, 40 ),
                             blue:   context.get_instance( Phong_Model ).material( Color.of(  0,  0,  1, .8 ), .1, .7, 1, 40 ),
                             white:  context.get_instance( Phong_Model ).material( Color.of(  1,  1,  1,  1 ), .1,  1, 1, 40 ), 
                             brown: context.get_instance( Phong_Model ).material( Color.of(  0.42,  0.26,  0.15, 1 ), .1,  1, 1, 40 ), 
                             purple: context.get_instance( Phong_Model ).material( Color.of(  1,  0,  1, 1 ), .1,  1, 1, 40 ),
                             pink: context.get_instance( Phong_Model ).material( Color.of(  0.419608,  0.137255,  0.556863, 1 ), .1,  1, 1, 40 ),
                             tan: context.get_instance( Phong_Model ).material( Color.of(  0.858824,  0.576471,  0.439216, 1 ), .1,  1, 1, 40 ),
                             darkWood: context.get_instance( Phong_Model ).material( Color.of(  0.52,  0.37,  0.26, .9 ), .1, .7, 1, 40 ),
                             violet: context.get_instance( Phong_Model ).material( Color.of(  0.31,  0.18,  0.31, 1 ), .1, .7, 1, 40 ),
                             silver: context.get_instance( Phong_Model ).material( Color.of( .8, .8, .8,  1 ),  0,  1, 1, 40 ) } );
    }
  make_control_panel()                                                              // Draw the buttons, setup their actions and keyboard shortcuts, and monitor live variables.
    { const globals = this.globals;
      this.live_string( () => { return "Butterfly rotation angle: " + ( this.hover ? 0 : ( this.t % (2*Math.PI)).toFixed(2) ) + " radians" } );  this.new_line();
      this.key_triggered_button( "Hover in place", "h", function() { this.hover ^= 1; } ); this.new_line();      
    }  
  draw_arm( graphics_state, model_transform )
    { const arm = model_transform.times( Mat4.translation([ 0,0,3+1 ]) );
      this.shapes.ball.draw( graphics_state, arm, this.blue );
    }
  draw_right_leg(graphics_state, model_transform)
  {
      model_transform = model_transform.times(Mat4.scale(Vec.of(1/2,2,1/2))); // box is 2 by 4 by 2
      this.shapes.box.draw(graphics_state, model_transform, this.silver );
      model_transform = model_transform.times(Mat4.scale(Vec.of(2,1/2,2))); //scale back to normal coordinates
      //move to the axis of attachment
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2, -1/2)));
      model_transform = model_transform.times(Mat4.rotation( 20 * Math.PI / 180, Vec.of(1,0,0))); // rotate along x axis into the butterfly
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2, 1/2))); //center of bottom portion of leg
      model_transform = model_transform.times(Mat4.scale(Vec.of(1/2,2,1/2))); // box is 2 by 4 by 2
      this.shapes.box.draw(graphics_state, model_transform, this.brown );
  }
    draw_left_leg(graphics_state, model_transform)
  {
      model_transform = model_transform.times(Mat4.scale(Vec.of(1/2,2,1/2))); // box is 2 by 4 by 2
      this.shapes.box.draw(graphics_state, model_transform, this.silver );
      model_transform = model_transform.times(Mat4.scale(Vec.of(2,1/2,2))); //scale back to normal coordinates
      //move to the axis of attachment
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2, 1/2)));
      model_transform = model_transform.times(Mat4.rotation( -20 * Math.PI / 180, Vec.of(1,0,0))); // rotate along x axis into the butterfly
      model_transform = model_transform.times(Mat4.translation(Vec.of(0, -2, -1/2))); //center of bottom portion of leg
      model_transform = model_transform.times(Mat4.scale(Vec.of(1/2,2,1/2))); // box is 2 by 4 by 2
      this.shapes.box.draw(graphics_state, model_transform, this.brown );
  }
  draw_wing(graphics_state, model_transform, num){
    // num = 1 to right side, num = -1 for lef side
      model_transform = model_transform.times(Mat4.rotation( num * 0.7 * Math.sin(this.t), Vec.of(1,0,0))); // rotate along x axis // 0.7 to restrict range so wings wont hit the head
      model_transform = model_transform.times(Mat4.translation(Vec.of(0,1/8, num * 8 ))); // 8 out, get to center of wing, 1/8 on y to get to the bottom of wing
      model_transform = model_transform.times(Mat4.rotation( 45 * Math.PI / 180, Vec.of(0,1,0))); // rotate along y axis by 45
      model_transform = model_transform.times(Mat4.scale(Vec.of(11.31371/2,1/8,11.31371/2))); //scale x and z by sqrt(128)/2
      this.shapes.box.draw(graphics_state, model_transform, this.pink );
  }
  draw_antenna(graphics_state, model_transform, num){
    // num = 1 for right side, num = -1 for left side
      model_transform = model_transform.times(Mat4.translation(Vec.of(8 + 4, 0, 0))); // middle of head
      model_transform = model_transform.times(Mat4.rotation( num * 40 * Math.PI / 180, Vec.of(0,1,0))); // rotate y axis -15 degrees, depending on side
      model_transform = model_transform.times(Mat4.rotation( -45 * Math.PI / 180, Vec.of(0,0,1))); // rotate z back -10 degrees 
      model_transform = model_transform.times(Mat4.translation(Vec.of(0,4 + 1/2, 0))); // translate to corner of ball plus half box length
      model_transform = model_transform.times(Mat4.scale(Vec.of(3/8,1/2,3/8)));
      this.shapes.box.draw(graphics_state, model_transform, this.silver);
      //repeat 8 times:
      let R = -5;
      for( let i = 0; i < 8; i++ )  {
      model_transform = model_transform.times(Mat4.scale(Vec.of(8/3,2,8/3))); //scale back
      model_transform = model_transform.times(Mat4.translation(Vec.of(3/8, 1/2, 0))); //translte to upper part box where the attachment is
      model_transform = model_transform.times(Mat4.rotation( R * Math.PI / 180, Vec.of(0,0,1))); //rotate on z axis
      model_transform = model_transform.times(Mat4.rotation( 0.09 * Math.sin(this.t) , Vec.of(0,0,1)));
      model_transform = model_transform.times(Mat4.translation(Vec.of(-3/8, 1/2, 0))); // translate to middle of next box
      //then draw a box
      model_transform = model_transform.times(Mat4.scale(Vec.of(3/8,1/2,3/8)));
      this.shapes.box.draw(graphics_state, model_transform, this.silver);
      R = R - 1; // make antennas bend more
   }
      model_transform = model_transform.times(Mat4.scale(Vec.of(8/3,2,8/3))); //scale back
      model_transform = model_transform.times(Mat4.translation(Vec.of(3/8, 1/2, 0))); //translte to upper part box where the attachment is
      model_transform = model_transform.times(Mat4.translation(Vec.of(-3/8, 1/2 + 1/2, 0))); // translate to middle of next box
      this.shapes.ball.draw(graphics_state, model_transform, this.pink);
  }
  display( graphics_state )
    { graphics_state.lights = [ new Light( Vec.of(  30, 30,  34, 1 ), Color.of( 0, .4, 0, 1 ), 100000 ),         // Lights for Phong_Shader to use
                                new Light( Vec.of( -10, 20, -14, 0 ), Color.of( 1, 1, .3, 1 ), 100    ) ]
                                
                                
      /**********************************
      Start coding down here!!!!
      **********************************/                                     // From here on down it's just some example shapes drawn 
                                                                              // for you -- freely replace them with your own!                          
                                
    this.t = graphics_state.animation_time/1000;    
    let model_transform = Mat4.identity();  // start with identity matrix
    let matrix_stack = [model_transform]; 
    
    matrix_stack.push(model_transform); 
    model_transform = model_transform.times(Mat4.translation(Vec.of(0,-20,0))); // translate 20 below butterfly location
    this.shapes.box.draw( graphics_state, model_transform.times( Mat4.scale([ 50,1,50 ]) ), this.green ); //ground plate
    model_transform = matrix_stack.pop(); // get origincal matrix again
    // All rotations to make the butterfly go in a circle, up and down, and tilted upward a little
        if( !this.hover ) {
         model_transform = model_transform.times(Mat4.rotation( this.t, Vec.of(0,1,0)));
         model_transform = model_transform.times(Mat4.rotation(  15 * Math.PI / 180 , Vec.of(0,0,1)));
         model_transform = model_transform.times(Mat4.translation(Vec.of(0, 5 * Math.sin(5 * this.t),0)));
         model_transform = model_transform.times(Mat4.translation(Vec.of(0,0,20)));     
      }
      matrix_stack.push(model_transform); //make this matrix the starting point to all other shapes
      //butterfly's bodt
      this.shapes.box.draw( graphics_state, model_transform.times( Mat4.scale([ 8,2,2 ])), this.darkWood );
      //tranlate to one side and put head
      model_transform = model_transform.times(Mat4.translation( Vec.of(12,0,0))); // 8 + 4 = 12
      model_transform = model_transform.times(Mat4.scale(Vec.of(4,4,4))); // radius of ball = 4
      this.shapes.ball.draw( graphics_state, model_transform, this.brown );
      //translate to the back of the butterfly and add tail
       model_transform = matrix_stack.pop();
       matrix_stack.push(model_transform); //remember location of middle of body
      model_transform = model_transform.times(Mat4.translation( Vec.of(-13,0,0))); // -8 -5 = -13 to the left
      model_transform = model_transform.times(Mat4.scale(Vec.of(5,1.5 ,1.5))); // readius of 5
      this.shapes.ball.draw(graphics_state, model_transform, this.darkWood );
      //draw all wings
     
      model_transform = matrix_stack.pop(); //return to center 
      matrix_stack.push(model_transform); // remember current location
      model_transform = model_transform.times(Mat4.translation(Vec.of(8,2,2))); //get to the point of attachment
      this.draw_wing(graphics_state, model_transform, 1); // 1 for right side
      model_transform = model_transform.times(Mat4.translation(Vec.of(-8 - 8,0,0))); //get to the point of attachment
      this.draw_wing(graphics_state, model_transform, 1);
      model_transform = model_transform.times(Mat4.translation(Vec.of(8 + 8,0,-2 - 2))); //get to the point of attachment
      this.draw_wing(graphics_state, model_transform, -1); // -1 for left side
 
      model_transform = model_transform.times(Mat4.translation(Vec.of(-8 - 8,0,0))); //get to the point of attachment
      this.draw_wing(graphics_state, model_transform, -1);
      
      //return to center
      // draw all right legs
      let num = 0;
      for(let i=0; i<3; i++){
        model_transform = matrix_stack.pop(); // return to center of body
        matrix_stack.push(model_transform); // remember location
        model_transform = model_transform.times(Mat4.translation(Vec.of(8,-2,2))); // bottom corner on positive z side
        model_transform = model_transform.times(Mat4.rotation(-0.2 + 0.2 * Math.sin(-this.t), Vec.of(1,0,0))); // rotate along x axis
        model_transform = model_transform.times(Mat4.translation(Vec.of(-1/2 - (3 * num),-2,1/2))); //center of leg
        this.draw_right_leg(graphics_state, model_transform);
        num += 1;
      }
      // draw all left legs
      num = 0;
      for(let i=0; i<3; i++){
        model_transform = matrix_stack.pop(); // return to center of body
        matrix_stack.push(model_transform); //remember location
        model_transform = model_transform.times(Mat4.translation(Vec.of(8,-2,-2))); // bottom corner on negative z side
        model_transform = model_transform.times(Mat4.rotation(0.2 + 0.2 * Math.sin(this.t), Vec.of(1,0,0))); // rotate along x axis
        model_transform = model_transform.times(Mat4.translation(Vec.of(-1/2 - (3 * num),-2,-1/2))); //center of upper portion of leg
        this.draw_left_leg(graphics_state, model_transform);
        num += 1;
      }
      // draw antennas 
      // Return to center
      // draw left antenna
      model_transform = matrix_stack.pop(); // return to center of body
      matrix_stack.push(model_transform);
      this.draw_antenna(graphics_state, model_transform, 1);
      // draw right antenna
      model_transform = matrix_stack.pop(); // return to center of body
      matrix_stack.push(model_transform);
      this.draw_antenna(graphics_state, model_transform, -1);
                                                                   
    }    
}
</script>
<style>
  table { border-collapse: collapse; display:block; overflow-x: auto; }
  table, th, td { border: 2px solid black; vertical-align: top; white-space: nowrap }
  th, td { overflow: hidden;  }
  button { position: relative; background-color: #4C9F50; color: white; padding: 6px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); transition: background-color .3s, transform .3s }
  button:hover, button:focus { transform: scale(1.2); color:gold }
  .dropdown { display:inline-block }
  .dropdown-content { display: none; position: absolute; background-color: #f9f9f9; min-width: 100px; overflow: auto; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2) }
  .dropdown-content a { color: black; padding: 4px 4px; display: block }
  .dropdown a:hover { background-color: #f1f1f1 }
  .show { display:inline-block }
</style>
</head><body>
<div id="canvases"></div>
<table id="control_buttons" class="dropdown" style="display:block; width: 70%;  border: 0px; margin: 0 0 50px 0"><tr></tr></table>
<div id="code_display" style="font-family: monospace; white-space: pre; margin: 50px 0" ></div>
<table id="class_list" class="dropdown" style="display:block; border: 0px; border-spacing: 10px " >
<tr><td colspan=2>Click below to navigate through all classes that are defined. <br>&nbsp;<br>Main demo: <span name="main_demo_link"></span></td></tr>
<tr style="text-align:center"><td>tinywebgl-ucla.js</td><td>dependencies.js</td></tr><tr></tr></table>
</body></html>