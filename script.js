function animation(args) {
   args = args || {};

   var easing = args.easing || function (t) { return t };
   var obj = args.obj;

   var style = window.getComputedStyle(obj);

   var start_pos = parseInt(style.top.replace("%", ""), 10),
      end_pos = args.end !== undefined ? args.end : start_pos,
      msec = args.msec || 1000;


   var start = window.performance.now(),
      delta = end_pos - start_pos;

   function frame() {
      var now = window.performance.now();
      var t = (now - start) / msec;

      if (t >= 1) {
         obj.style.top = end_pos + "%";
         return;
      }

      var proportion = easing(t);
      obj.style.top = (start_pos + proportion * delta) + "%";

      requestAnimationFrame(frame);
   }

   requestAnimationFrame(frame);
}

function clamp(x, min, max) {
   return Math.min(Math.max(x, min), max);
}

function bounceFactory(bounces, threshold) {
   threshold = threshold || 0.001;

   function energy_to_height(energy) {
      return energy; // h = E/mg
   }

   function height_to_energy(height) {
      return height; // E = mgh
   }

   function bounce_time(height) {
      return 2 * Math.sqrt(2 * height);
   }

   function speed(energy) {
      return Math.sqrt(2 * energy); // E = 1/2 m v^2, s = |sqrt(2E/m)|
   }

   var height = 1;
   var potential = height_to_energy(height);

   var elasticity = Math.pow(threshold, 1 / bounces);



   var critical_points = [{
      time: - bounce_time(height) / 2,
      energy: potential,
   },
   {
      time: bounce_time(height) / 2,
      energy: potential * elasticity,
   }];

   potential *= elasticity;
   height = energy_to_height(potential);

   var time = critical_points[1].time;
   for (var i = 1; i < bounces; i++) {
      time += bounce_time(height);
      potential *= elasticity;

      critical_points.push({
         time: time,
         energy: potential,
      });

      height = energy_to_height(potential);
   }

   var duration = time;

   return function (t) {
      t = clamp(t, 0, 1);

      var tadj = t * duration;

      if (tadj === 0) {
         return 0;
      }
      else if (tadj >= duration) {
         return 1;
      }


      var index;
      for (index = 0; index < critical_points.length; index++) {
         if (critical_points[index].time > tadj) {
            break;
         }
      }

      var bouncept = critical_points[index - 1];


      tadj -= bouncept.time;

      var v0 = speed(bouncept.energy);


      var pos = v0 * tadj + -0.5 * tadj * tadj;

      return 1 - pos;
   };
};

window.onload = function () {
   var ball = document.getElementById('ball');

   animation({
      obj: ball,
      end: 40,
      msec: 3750,
      easing: bounceFactory(20, 0.01),
   });
};