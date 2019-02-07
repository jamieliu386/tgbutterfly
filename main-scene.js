class Assignment_One_Scene extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -35]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
        // design.  Once you've told the GPU what the design of a cube is,
        // it would be redundant to tell it again.  You should just re-use
        // the one called "box" more than once in display() to draw
        // multiple cubes.  Don't define more than one blueprint for the
        // same thing here.
        const shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'prism': new TriangularPrism()
        }
        this.submit_shapes(context, shapes);

        // Make some Material objects available to you:
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        
        this.lights = [new Light(Vec.of(10, 10, 20, 1), Color.of(1, .4, 1, 1), 100000)];

        this.blue = Color.of(0, 186/255, 1, 1);
        this.green = Color.of(0, 1, 186/255, 1);
        this.dark_blue = Color.of(0, 120/255,1,1);
        
       

        this.t = 0;
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Hover in Place", ["m"], () => {
            this.hover = !this.hover;
        });
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
        this.key_triggered_button("Show/Hide Feet", ["g"], () => {
            this.feet = !this.feet;
        })
    }

    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;

        // Variable m will be a temporary matrix that helps us draw most shapes.
        // It starts over as the identity every single frame - coordinate axes at the origin.
        let m = Mat4.identity();
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        /* MY BUTTERFLY IMPLEMENTATION */
        if (this.hover == false) {
            m = m.times(Mat4.rotation(this.t, Vec.of(0,1,0))) // rotate y axis wrt time 
                 .times(Mat4.translation(Vec.of(0, 2 * Math.sin(4 * this.t), 0))) // make y vary as butterfly flaps
                 .times(Mat4.rotation(Math.PI/10, Vec.of(0,0,-1))) // tilt butterfly upwards
                 .times(Mat4.translation(Vec.of(0,0,-30))) // move entire system out from y axis
        }

        this.draw_body(graphics_state, m); // draw the thorax, head, and abdomen

        // draw wing on each side 
        this.draw_wing(graphics_state, m, -1);
        this.draw_wing(graphics_state, m, 1);

        // draw legs on each side
        this.draw_leg(graphics_state, m, 1);
        this.draw_leg(graphics_state, m, -1);

        // draw antennae on each side
        this.draw_antennae(graphics_state, m, 1);
        this.draw_antennae(graphics_state, m, -1);

    }

    draw_body(graphics_state, m) {
        this.shapes.box.draw( // thorax
            graphics_state,
            m.times(Mat4.scale(Vec.of(8,2,2))),
            this.plastic.override({color: this.blue }));
        this.shapes.ball.draw( // head
            graphics_state,
            m.times(Mat4.translation(Vec.of(-12, 0, 0))) // translate to end of thorax
             .times(Mat4.scale(4)), // scale to correct size
            this.plastic.override({color: this.dark_blue }));
        this.shapes.ball.draw( // abdomen
            graphics_state,
            m.times(Mat4.translation(Vec.of(12.5, 0, 0))) // translate to end of thorax
             .times(Mat4.scale(Vec.of(4.5, 2, 2))), // scale to correct size
            this.plastic.override({color: this.dark_blue }));
    }

    draw_wing (graphics_state, m, side) {
        const deg = side * 0.7 * Math.sin(4 * this.t)
        this.shapes.prism.draw( // triangle part
            graphics_state,
            m.times(Mat4.translation(Vec.of(0,2 ,side * 2))) // align wing with thorax
             .times(Mat4.rotation(deg, Vec.of(1,0,0))) // apply flapping transformation through x axis
             .times(Mat4.rotation(side*-Math.PI/2, Vec.of(1,0,0))) // rotation to align hypotenuse with x axis
             .times(Mat4.rotation(Math.PI/4, Vec.of(0, 0, 1))) // rotation to align rotation axis in xz plane
             .times(Mat4.translation(Vec.of(-(1/2)*8*Math.sqrt(2), -(1/2)*8*Math.sqrt(2), side*.1))) // translate so rotation axis (hypotenuse of triangle) passes through origin
             .times(Mat4.scale(Vec.of(8*Math.sqrt(2), 8*Math.sqrt(2), .1))), // scale the prism to be wing shaped
            this.plastic.override({color:this.green}));
        this.shapes.box.draw( // larger square on the thorax, closer to the head
            graphics_state,
            m
             .times(Mat4.translation(Vec.of(-8,2,side * 2)))
             .times(Mat4.rotation(deg, Vec.of(1,0,0))) // apply flapping transformation through x axis
             .times(Mat4.rotation(Math.PI/4, Vec.of(0,side * 1,0))) // rotate around y axis
             .times(Mat4.translation(Vec.of(-8, .1, side*8))) // translate point of rotation to the origin
             .times(Mat4.scale(Vec.of(8,0.1,8))) // scale the box to correct size
            ,
            this.plastic.override({color: this.dark_blue}));
        this.shapes.box.draw( // smaller square on the thorax, closer to the abdomen
            graphics_state,
            m
             .times(Mat4.translation(Vec.of(8,2,side * 2)))
             .times(Mat4.rotation(deg, Vec.of(1,0,0))) // apply flapping transformation through x axis
             .times(Mat4.rotation(Math.PI/4, Vec.of(0,side * 1,0))) // rotate around y axis
             .times(Mat4.translation(Vec.of(-4*Math.sqrt(2), .1, side*4*Math.sqrt(2)))) // translate point of rotation to the origin
             .times(Mat4.scale(Vec.of(4*Math.sqrt(2),0.1,4*Math.sqrt(2)))) // scale the box to correct size
            ,
            this.plastic.override({color: this.blue}));
    }

     draw_leg (graphics_state, m, side) {
         const deg = 1 + Math.sin(this.t);
         let m_backup = m; // save current m 
         for (var i = -1; i < 2; ++i){ // loop iterates through the three legs on one side
            m = m_backup; // reset m to initial m 
            m = m.times(Mat4.translation(Vec.of(i * 4, -2, side * 2))) // translate to thorax edge... x translation depends on which leg (-1,0,1)
                 .times(Mat4.rotation( -0.18 * side * deg, Vec.of(1,0,0))) // apply rotation through x axis
                 .times(Mat4.translation(Vec.of(0, -2, side * 0.4))) // translate axis of rotation to the origin
            this.shapes.box.draw( // main leg section
                graphics_state,
                m.times(Mat4.scale(Vec.of(.4, 2, .4))), // scale to correct leg size
                this.plastic.override({color:this.green}));
            m = m.times(Mat4.translation(Vec.of(0, -2, side * -.4))) // translate to other leg part's edge
                 .times(Mat4.rotation(.36 * side * deg, Vec.of(1,0,0))) // apply rotation through x axis
                 .times(Mat4.translation(Vec.of(0, -2, side*0.4))) // translate axis of rotation 
             this.shapes.box.draw(
                graphics_state,
                m.times(Mat4.scale(Vec.of(.4, 2, .4))), // scale to correct leg size
                this.plastic.override({color:this.dark_blue})
             )
             if (this.feet){
                 this.shapes.box.draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0, -2.3, side*.2)))
                     .times(Mat4.scale(Vec.of(.5, .3, .7))),
                    this.plastic.override({color:this.green})
                 )
             }
         }
     }

    draw_antennae(graphics_state, m, side) {
        m = m.times(Mat4.translation(Vec.of(-12,0,0))) // translate to middle of head
             .times(Mat4.rotation(Math.PI/11, Vec.of(0,side * 1,0))) // rotate around y axis to point left/right ish
             .times(Mat4.rotation(Math.PI/3, Vec.of(0,0,1))) // rotate around z axis to point forward ish
             .times(Mat4.translation(Vec.of(0,4.4,0))) // translate to corner of head
        this.shapes.box.draw( // draw starting box
                graphics_state,
                m.times(Mat4.scale(0.4)), // scale box to correct size
                this.plastic.override({color:this.green}));
        const deg = -.065 * (1 + Math.sin(this.t));
        for (var i = 0; i < 8; ++i) {
            m = m.times(Mat4.translation(Vec.of(-.4, .4,0))) // translate to hinge on previous box
                 .times(Mat4.rotation(deg,Vec.of(0,0, -1))) // apply rotation animation
                 .times(Mat4.translation(Vec.of(.4, .4,0))); // move axis of rotation to origin
            this.shapes.box.draw(
                graphics_state,
                m.times(Mat4.scale(0.4)), // scale box to correct size
                this.plastic.override({color:this.green}));
        }
        this.shapes.ball.draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(0,1.4,0))),
            this.plastic.override({color: this.dark_blue}));               
    }
}

window.Assignment_One_Scene = window.classes.Assignment_One_Scene = Assignment_One_Scene;