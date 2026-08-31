import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextgen_scholar';
const DB_NAME = process.env.MONGODB_DB_NAME || 'nextgenscholar';

const pyqExams = [
  {
    title: "ICSE Class 10 Physics: Force, Moment & Circular Motion",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Force, Turning Effect, Moment of Force, and Circular Motion.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Force, Moment & Circular Motion",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q1(a) [2 Marks] Define moment of force. Write the relationship between the SI unit and CGS unit of moment of force.",
        options: [
          "1 N m = 10^7 dyn cm (Moment of force is the turning effect produced by a force about a pivot: Force × perpendicular distance)",
          "1 N m = 10^5 dyn cm",
          "1 N m = 10^3 dyn cm",
          "1 N m = 10^-7 dyn cm"
        ],
        correctOptionIndex: 0,
        explanation: "Moment of Force = Force × Perpendicular distance from pivot. SI unit is N m and CGS unit is dyn cm. 1 N m = (10^5 dyn) × (10^2 cm) = 10^7 dyn cm.",
        marks: 2
      },
      {
        questionText: "Q4(c) [2 Marks] When a current-carrying conductor is placed in a magnetic field, what should be the angle between the magnetic field and conductor so that the force is (i) zero, (ii) maximum?",
        options: [
          "(i) 0° (parallel), (ii) 90° (perpendicular)",
          "(i) 90° (perpendicular), (ii) 0° (parallel)",
          "(i) 45°, (ii) 90°",
          "(i) 0°, (ii) 180°"
        ],
        correctOptionIndex: 0,
        explanation: "Magnetic force F = I B L sin(θ). When θ = 0°, sin(0°) = 0, so Force is zero. When θ = 90°, sin(90°) = 1, so Force is maximum (F = I B L).",
        marks: 2
      },
      {
        questionText: "Q5(b) [3 Marks] With reference to direction of action, compare centripetal and centrifugal force. Is centrifugal force the reaction of centripetal force? Compare their magnitudes.",
        options: [
          "Centripetal acts towards the center; Centrifugal acts away from center. Centrifugal is NOT a reaction force (it is a pseudo force); Magnitudes are equal.",
          "Centripetal acts away from center; Centrifugal acts towards center. Centrifugal is a real reaction force; Magnitudes are unequal.",
          "Both act towards center; Centrifugal is a real reaction force; Magnitudes are equal.",
          "Both act away from center; Centrifugal is a reaction force; Magnitudes are zero."
        ],
        correctOptionIndex: 0,
        explanation: "Centripetal force is directed towards the center of circular path (real force). Centrifugal force is directed radially outwards in a rotating frame (fictitious/pseudo force, not a reaction force of Newton's third law). Their magnitudes are equal (|m v²/r|).",
        marks: 3
      },
      {
        questionText: "MCQ [1 Mark] Clockwise moment produced by a force about a fulcrum is conventionally considered to be:",
        options: [
          "Positive",
          "Negative",
          "Zero",
          "Infinite"
        ],
        correctOptionIndex: 1,
        explanation: "By international convention, anti-clockwise moment is taken as positive (+) and clockwise moment is taken as negative (-).",
        marks: 1
      },
      {
        questionText: "MCQ [2 Marks] A stone tied to a string is whirled in a horizontal circle. Name the force required and state its direction.",
        options: [
          "Centripetal force, directed towards the center of the circular path along the string",
          "Centrifugal force, directed radially outwards",
          "Gravitational force, directed vertically downwards",
          "Frictional force, directed tangentially"
        ],
        correctOptionIndex: 0,
        explanation: "The force necessary to maintain uniform circular motion is Centripetal force, provided by the tension in the string acting towards the center.",
        marks: 2
      },
      {
        questionText: "Q2(ii)(b) [2 Marks] When a triangular lamina is suspended freely from a vertex, what moment of force is produced by its own weight in the rest position?",
        options: [
          "Zero moment of force (the line of action of weight passes through the pivot vertex)",
          "Maximum clockwise moment",
          "Maximum anticlockwise moment",
          "Infinite moment"
        ],
        correctOptionIndex: 0,
        explanation: "In the rest (equilibrium) position, the center of gravity lies vertically below the point of suspension. Perpendicular distance of line of action of weight from pivot is zero, so moment of force is zero.",
        marks: 2
      },
      {
        questionText: "Q2(iii) [2 Marks] Three equal forces act at point B on a wheel pivoted at A. Which force produces maximum moment and why?",
        options: [
          "The force applied perpendicular to the radius line AB (perpendicular distance is maximum)",
          "The force applied along the line AB towards pivot A",
          "The force applied at an angle of 45° to line AB",
          "All three forces produce equal moment"
        ],
        correctOptionIndex: 0,
        explanation: "Moment of force = Force × Perpendicular distance. When force is applied at 90° to AB, the perpendicular distance from pivot A is maximum (equal to r), giving maximum moment.",
        marks: 2
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Work, Power, Energy & Machines",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Work, Power, Kinetic & Potential Energy, Levers and Pulley Systems.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Work, Power, Energy & Machines",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q1(b) [2 Marks] Define kilowatt hour (kWh). How is it related to joule?",
        options: [
          "1 kWh is the electrical energy consumed by a 1 kW appliance in 1 hour. 1 kWh = 3.6 × 10^6 J",
          "1 kWh is the power consumed in 1 second. 1 kWh = 3.6 × 10^3 J",
          "1 kWh = 10^6 J",
          "1 kWh = 3.6 × 10^5 J"
        ],
        correctOptionIndex: 0,
        explanation: "1 kWh = 1 kW × 1 h = (1000 W) × (3600 s) = 3,600,000 Joules = 3.6 × 10^6 J.",
        marks: 2
      },
      {
        questionText: "Q1(c) [2 Marks] A satellite revolves in a circular orbit around the Earth. What is the work done by gravitational force on the satellite at any instant? Give a reason.",
        options: [
          "Zero work done, because gravitational force is perpendicular to the satellite's displacement at any instant (θ = 90°)",
          "Maximum positive work done",
          "Negative work done against gravity",
          "Infinite work done"
        ],
        correctOptionIndex: 0,
        explanation: "W = F d cos(θ). Since gravitational centripetal force acts towards Earth's center and instantaneous displacement is tangent to the circular path, θ = 90°, cos(90°) = 0, so W = 0.",
        marks: 2
      },
      {
        questionText: "Q1(d) [2 Marks] Identify how to increase the Mechanical Advantage (M.A.) of a lever without increasing its total length.",
        options: [
          "Move the fulcrum closer to the load so that Effort Arm increases relative to Load Arm",
          "Move the fulcrum closer to the effort point",
          "Increase the magnitude of the load",
          "Decrease the length of the effort arm"
        ],
        correctOptionIndex: 0,
        explanation: "M.A. = Effort Arm / Load Arm. Shifting the fulcrum towards the load reduces the Load Arm and increases the Effort Arm, raising M.A. without changing total lever length.",
        marks: 2
      },
      {
        questionText: "Q2(a) [2 Marks] Two cranes do the same amount of work in 5 s and 2 s respectively. Compare their powers (P1 : P2).",
        options: [
          "P1 : P2 = 2 : 5",
          "P1 : P2 = 5 : 2",
          "P1 : P2 = 1 : 1",
          "P1 : P2 = 4 : 25"
        ],
        correctOptionIndex: 0,
        explanation: "Power = Work / Time. For equal work W, P1 / P2 = t2 / t1 = 2 / 5 = 2 : 5.",
        marks: 2
      },
      {
        questionText: "Q5(a) [3 Marks] Simple pendulum: mass 200 g (0.2 kg), bob raised to vertical height 5 m. Find potential energy at height, total mechanical energy, and speed at lowest position A (g = 10 m/s²).",
        options: [
          "P.E. = 10 J, Total Mechanical Energy = 10 J, Speed at lowest point = 10 m/s",
          "P.E. = 100 J, Total Mechanical Energy = 100 J, Speed = 5 m/s",
          "P.E. = 1 J, Total Mechanical Energy = 1 J, Speed = 10 m/s",
          "P.E. = 10 J, Total Mechanical Energy = 20 J, Speed = 20 m/s"
        ],
        correctOptionIndex: 0,
        explanation: "P.E. = m g h = 0.2 × 10 × 5 = 10 J. By conservation of energy, Total Energy = 10 J. At lowest point A, K.E. = 10 J => 1/2 m v² = 10 => 1/2(0.2) v² = 10 => v² = 100 => v = 10 m/s.",
        marks: 3
      },
      {
        questionText: "Q5(c) [4 Marks] A block and tackle system has Velocity Ratio (V.R.) = 4. State its V.R. if the weight of the movable block is doubled.",
        options: [
          "V.R. remains 4 (V.R. depends only on the number of pulleys/string segments, not weight)",
          "V.R. becomes 8",
          "V.R. becomes 2",
          "V.R. becomes 0"
        ],
        correctOptionIndex: 0,
        explanation: "Velocity Ratio (V.R.) = Distance moved by Effort / Distance moved by Load = n = 4. V.R. depends purely on system geometry and is independent of weight or friction.",
        marks: 4
      },
      {
        questionText: "MCQ [1 Mark] A coolie raises a load vertically upwards against gravity. The work done by the load's weight (gravity) is:",
        options: [
          "Zero",
          "Positive",
          "Negative",
          "Infinite"
        ],
        correctOptionIndex: 2,
        explanation: "Weight acts downwards while displacement is upwards (θ = 180°). W = F d cos(180°) = - F d (negative work).",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] When the speed of a moving body is doubled, its kinetic energy becomes:",
        options: [
          "Doubled",
          "Four times",
          "Half",
          "Eight times"
        ],
        correctOptionIndex: 1,
        explanation: "K.E. = 1/2 m v². If v' = 2v, K.E.' = 1/2 m (2v)² = 4 × (1/2 m v²) = 4 K.E.",
        marks: 1
      },
      {
        questionText: "MCQ [4 Marks] A 200 g (0.2 kg) body falls freely from 15 m (g = 10 m/s²): find P.E. at 10 m, gain in K.E. at 10 m, total mechanical energy, and impact velocity at ground.",
        options: [
          "P.E. = 20 J, Gain in K.E. = 10 J, Total Energy = 30 J, Impact velocity = 17.32 m/s (√300)",
          "P.E. = 30 J, Gain in K.E. = 20 J, Total Energy = 50 J, Impact velocity = 10 m/s",
          "P.E. = 10 J, Gain in K.E. = 20 J, Total Energy = 30 J, Impact velocity = 15 m/s",
          "P.E. = 20 J, Gain in K.E. = 30 J, Total Energy = 50 J, Impact velocity = 25 m/s"
        ],
        correctOptionIndex: 0,
        explanation: "Total Energy = m g h_max = 0.2 × 10 × 15 = 30 J. At h = 10 m: P.E. = 0.2 × 10 × 10 = 20 J. Gain in K.E. = 30 - 20 = 10 J. Impact v = √(2 g h_max) = √(2 × 10 × 15) = √300 ≈ 17.32 m/s.",
        marks: 4
      },
      {
        questionText: "MCQ [1 Mark] A single fixed pulley has load = 100 N and effort applied = 200 N. Calculate its Mechanical Advantage (M.A.).",
        options: [
          "0.5",
          "2.0",
          "1.0",
          "5.0"
        ],
        correctOptionIndex: 0,
        explanation: "M.A. = Load / Effort = 100 N / 200 N = 0.5.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Why is a single fixed pulley used even though its Mechanical Advantage is <= 1?",
        options: [
          "To change the direction of effort to a convenient downward direction",
          "To multiply force",
          "To gain speed",
          "To increase work output"
        ],
        correctOptionIndex: 0,
        explanation: "Pulling downwards uses the body's own weight, making it much easier to lift loads against gravity.",
        marks: 1
      },
      {
        questionText: "Q2(v) [2 Marks] Calculate power spent by a crane lifting a 2000 kg load at a constant velocity of 0.5 m/s (g = 10 m/s²).",
        options: [
          "10 kW (10,000 W)",
          "1 kW",
          "100 kW",
          "5 kW"
        ],
        correctOptionIndex: 0,
        explanation: "Power P = Force × velocity = (m g) × v = (2000 × 10) × 0.5 = 10,000 W = 10 kW.",
        marks: 2
      },
      {
        questionText: "Q6(iii) [3 Marks] A 120 kg car accelerates from 18 km/h (5 m/s) to 54 km/h (15 m/s) in 5 s. Calculate work done and power developed.",
        options: [
          "Work Done = 12,000 J (12 kJ), Power = 2,400 W (2.4 kW)",
          "Work Done = 24,000 J, Power = 4,800 W",
          "Work Done = 6,000 J, Power = 1,200 W",
          "Work Done = 15,000 J, Power = 3,000 W"
        ],
        correctOptionIndex: 0,
        explanation: "Work = ΔK.E. = 1/2 m (v2² - v1²) = 1/2 × 120 × (15² - 5²) = 60 × (225 - 25) = 12,000 J. Power = W / t = 12,000 / 5 = 2,400 W.",
        marks: 3
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Light – Reflection, Refraction, Prism & Lenses",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Snell's Law, Prism Deviation, Critical Angle, TIR, Lenses & Dispersion.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Light – Reflection, Refraction, Prism & Lenses",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q2(b) [2 Marks] A ray of light is normally incident on a rectangular glass slab. What is its angle of refraction?",
        options: [
          "0° (the ray passes straight without any deviation)",
          "90°",
          "45°",
          "30°"
        ],
        correctOptionIndex: 0,
        explanation: "For normal incidence, angle of incidence i = 0°. By Snell's Law (sin i / sin r = μ), sin r = 0 => r = 0°.",
        marks: 2
      },
      {
        questionText: "Q2(d) [2 Marks] Where should an object be placed in front of a convex lens to obtain (i) an enlarged real image, and (ii) an enlarged virtual image?",
        options: [
          "(i) Between F and 2F, (ii) Between F and Optical Center O",
          "(i) Beyond 2F, (ii) At 2F",
          "(i) At F, (ii) Beyond 2F",
          "(i) At infinity, (ii) At F"
        ],
        correctOptionIndex: 0,
        explanation: "(i) Object between F and 2F yields real, inverted, enlarged image beyond 2F. (ii) Object between F and O yields virtual, erect, magnified image on same side.",
        marks: 2
      },
      {
        questionText: "Q2(e) [2 Marks] A pond appears to be 2.7 m deep when viewed vertically. Given refractive index of water μ = 4/3, calculate its actual depth.",
        options: [
          "3.6 m",
          "2.0 m",
          "4.0 m",
          "5.4 m"
        ],
        correctOptionIndex: 0,
        explanation: "μ = Real Depth / Apparent Depth => Real Depth = μ × Apparent Depth = (4/3) × 2.7 = 3.6 m.",
        marks: 2
      },
      {
        questionText: "Q3(a) [2 Marks] Compare the speeds of red light and blue light in (i) vacuum, and (ii) a glass slab.",
        options: [
          "In vacuum: Speed of Red = Speed of Blue (3 × 10^8 m/s); In glass: Speed of Red > Speed of Blue",
          "In vacuum: Red > Blue; In glass: Red = Blue",
          "In vacuum: Blue > Red; In glass: Blue > Red",
          "In vacuum and glass: Red = Blue always"
        ],
        correctOptionIndex: 0,
        explanation: "All EM wavelengths travel at c = 3 × 10^8 m/s in vacuum. In glass, μ_blue > μ_red, so v = c/μ implies v_red > v_blue.",
        marks: 2
      },
      {
        questionText: "Q6(b) [3 Marks] A light ray is incident normally on the first surface of a 45°-45°-90° glass prism (critical angle i_c = 42°). What happens at the hypotenuse face?",
        options: [
          "Total Internal Reflection occurs (angle of incidence 45° > critical angle 42°), turning the ray by 90°",
          "The ray refracts into air at 45°",
          "The ray is absorbed completely",
          "The ray reflects directly back along incident path"
        ],
        correctOptionIndex: 0,
        explanation: "Ray enters first face at 90° undeviated and strikes hypotenuse inside glass at i = 45°. Since 45° > i_c (42°), Total Internal Reflection occurs.",
        marks: 3
      },
      {
        questionText: "Q6(c) [4 Marks] A convex lens of focal length f = 20 cm forms a real inverted image at v = +60 cm. Find object distance u and magnification m.",
        options: [
          "u = -30 cm, m = -2",
          "u = -15 cm, m = +3",
          "u = -40 cm, m = -1",
          "u = -60 cm, m = -0.5"
        ],
        correctOptionIndex: 0,
        explanation: "1/f = 1/v - 1/u => 1/20 = 1/60 - 1/u => 1/u = 1/60 - 1/20 = -1/30 => u = -30 cm. m = v / u = 60 / (-30) = -2.",
        marks: 4
      },
      {
        questionText: "Q7(a) [3 Marks] Give reasons why (i) clouds appear white, and (ii) clear sky appears blue.",
        options: [
          "Sky: Rayleigh scattering of shorter wavelengths (blue) by air molecules (size << λ). Clouds: Large water droplets (size >> λ) scatter all wavelengths equally (Mie scattering)",
          "Sky absorbs red light; clouds reflect sunlight without scattering",
          "Sky scatters red light; clouds contain white pigments",
          "Refraction in atmosphere causes blue sky and white clouds"
        ],
        correctOptionIndex: 0,
        explanation: "Rayleigh scattering intensity ∝ 1/λ⁴, so blue light is scattered most by air molecules. Water droplets in clouds are large compared to λ, scattering all visible colors equally to yield white light.",
        marks: 3
      },
      {
        questionText: "MCQ [1 Mark] Angle of deviation produced by an equilateral glass prism does NOT depend on:",
        options: [
          "Angle of incidence",
          "Physical size of the prism",
          "Material of the prism",
          "Wavelength of incident light"
        ],
        correctOptionIndex: 1,
        explanation: "Angle of deviation depends on angle of incidence, prism angle A, material refractive index μ, and light wavelength λ, but is independent of prism size.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] What is the physical meaning of statement 'Refractive index of diamond is 2.4'?",
        options: [
          "Speed of light in vacuum is 2.4 times the speed of light in diamond",
          "Speed of light in diamond is 2.4 times speed in vacuum",
          "Light travels at 2.4 m/s in diamond",
          "Critical angle of diamond is 90°"
        ],
        correctOptionIndex: 0,
        explanation: "μ = c / v_medium => c / v_diamond = 2.4 => Speed of light in vacuum is 2.4 times that in diamond.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Which color of white light is deviated LEAST when passing through a glass prism?",
        options: [
          "Red",
          "Violet",
          "Yellow",
          "Green"
        ],
        correctOptionIndex: 0,
        explanation: "Red light has the longest wavelength λ in visible spectrum, lowest refractive index μ in glass, hence suffers least deviation.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] The silvery appearance of small air bubbles in a fish tank when viewed from a particular angle is due to:",
        options: [
          "Total Internal Reflection",
          "Refraction of light",
          "Dispersion of light",
          "Interference of light"
        ],
        correctOptionIndex: 0,
        explanation: "Light traveling in water incident on water-air bubble interface at i > i_c undergoes Total Internal Reflection, making the bubble surface shine like a silver mirror.",
        marks: 1
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Sound & Vibrations",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Free/Damped Vibrations, Resonance, SONAR, Echoes & Sound Characteristics.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Sound & Vibrations",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q3(b) [2 Marks] What is the shape of displacement-time graph for free vibrations of a body in vacuum?",
        options: [
          "A sine wave of constant amplitude and constant frequency (undamped oscillation)",
          "A sine wave of exponentially decreasing amplitude",
          "A sine wave of increasing amplitude",
          "A straight line parallel to time axis"
        ],
        correctOptionIndex: 0,
        explanation: "In vacuum, there are no frictional/resistive forces, so mechanical energy is conserved and amplitude remains constant over time.",
        marks: 2
      },
      {
        questionText: "Q3(c) [2 Marks] A sound wave in water has wavelength 0.4 m and speed 1500 m/s. Is this sound audible to humans in air? (v_air = 320 m/s).",
        options: [
          "Yes, audible (frequency f = v/λ = 1500 / 0.4 = 3750 Hz, which lies between 20 Hz and 20,000 Hz)",
          "No, it is infrasonic (< 20 Hz)",
          "No, it is ultrasonic (> 20,000 Hz)",
          "No, sound cannot travel from water to air"
        ],
        correctOptionIndex: 0,
        explanation: "Frequency remains constant across media: f = 1500 / 0.4 = 3750 Hz. Since 20 Hz < 3750 Hz < 20,000 Hz, it is in the human audible frequency range.",
        marks: 2
      },
      {
        questionText: "Q7(b) [3 Marks] Name the underwater locating system using ultrasonic waves and reflection; state the physical quantities determining Pitch and Loudness.",
        options: [
          "System: SONAR; Pitch depends on Frequency; Loudness depends on Amplitude",
          "System: RADAR; Pitch depends on Amplitude; Loudness depends on Frequency",
          "System: Echo Sounder; Pitch depends on Wavelength; Loudness depends on Speed",
          "System: Ultrasound scanner; Pitch depends on Phase; Loudness depends on Time"
        ],
        correctOptionIndex: 0,
        explanation: "SONAR (Sound Navigation and Ranging) uses reflection of ultrasonic waves. Pitch is determined by sound frequency; Loudness is determined by amplitude squared.",
        marks: 3
      },
      {
        questionText: "Q7(c) [4 Marks] Explain why a vibrating tuning fork produces a louder sound when its stem is pressed against a wooden table; calculate cliff distance if echo is heard after 3 s (v = 340 m/s).",
        options: [
          "Table top is forced to vibrate with large surface area setting large volume of air in motion; Cliff distance d = (v × t)/2 = (340 × 3)/2 = 510 m",
          "Resonance occurs; Distance = 1020 m",
          "Free vibration; Distance = 340 m",
          "Reflection increases frequency; Distance = 680 m"
        ],
        correctOptionIndex: 0,
        explanation: "Forced vibrations of large table surface push a much larger volume of air molecules. Echo distance 2d = v t => d = (340 × 3)/2 = 510 m.",
        marks: 4
      },
      {
        questionText: "MCQ [1 Mark] Which type of sound waves are used in echo depth sounding by ships?",
        options: [
          "Ultrasonic waves",
          "Infrasonic waves",
          "Radio waves",
          "Microwaves"
        ],
        correctOptionIndex: 0,
        explanation: "Ultrasonic waves (> 20 kHz) have high frequency, short wavelength, and can travel long distances in concentrated directional beams without easily bending.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Vibrations produced in a body under the influence of a continuous external periodic force are called:",
        options: [
          "Forced vibrations",
          "Free vibrations",
          "Damped vibrations",
          "Natural vibrations"
        ],
        correctOptionIndex: 0,
        explanation: "When a body vibrates under an external periodic force, its vibrations are called forced vibrations at the frequency of the applied force.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Two musical notes having the same loudness and pitch played on different musical instruments (e.g. Violin and Flute) differ in:",
        options: [
          "Quality or Timbre (wave pattern / overtones)",
          "Frequency",
          "Amplitude",
          "Speed"
        ],
        correctOptionIndex: 0,
        explanation: "Quality or timbre depends on the shape of waveform and the presence/relative intensities of subsidiary overtones.",
        marks: 1
      },
      {
        questionText: "Q7(i) [3 Marks] School bell: which characteristic of sound changes when struck harder; calculate distance to reflector if ultrasonic wave echo returns in 1.4 s (v = 1500 m/s in water).",
        options: [
          "Characteristic: Loudness increases (due to larger amplitude); Reflector distance d = (1500 × 1.4)/2 = 1050 m",
          "Pitch increases; Distance = 2100 m",
          "Quality changes; Distance = 525 m",
          "Speed increases; Distance = 1500 m"
        ],
        correctOptionIndex: 0,
        explanation: "Striking harder increases amplitude of vibration, increasing loudness. Distance d = (v t)/2 = (1500 × 1.4)/2 = 1050 m.",
        marks: 3
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Heat & Calorimetry",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Specific Heat Capacity, Latent Heat, Calorimetry Principle & Heating Curves.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Heat & Calorimetry",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q3(d) [2 Marks] Why does a stone kept in the sun heat up much faster and reach a higher temperature than an equal mass of water for the same duration?",
        options: [
          "Stone has a much lower specific heat capacity than water (c_stone << c_water), so same heat input causes larger temperature rise (ΔT = Q / m c)",
          "Stone absorbs more radiation than water",
          "Water reflects all heat energy",
          "Stone has higher specific heat capacity than water"
        ],
        correctOptionIndex: 0,
        explanation: "Specific heat capacity of water is very high (~4200 J/kg K) compared to stone (~800 J/kg K). For same Q and m, ΔT is inversely proportional to specific heat capacity c.",
        marks: 2
      },
      {
        questionText: "Q4(b) [2 Marks] Two bodies of masses in ratio 2 : 1 are supplied equal heat energy and experience equal temperature rise. Compare their specific heat capacities (c1 : c2).",
        options: [
          "1 : 2",
          "2 : 1",
          "1 : 1",
          "1 : 4"
        ],
        correctOptionIndex: 0,
        explanation: "Q = m c ΔT. Since Q1 = Q2 and ΔT1 = ΔT2, m1 c1 = m2 c2 => c1 / c2 = m2 / m1 = 1 / 2 = 1 : 2.",
        marks: 2
      },
      {
        questionText: "Q9(a) [3 Marks] Define Heat Capacity of a body, state its SI unit, and state its relation with Specific Heat Capacity.",
        options: [
          "Heat Capacity C' = heat required to raise temperature of entire body by 1 K. SI unit: J/K. Relation: C' = mass (m) × specific heat capacity (c)",
          "Heat Capacity C' = heat per unit mass. Unit: J/kg. Relation: C' = c / m",
          "Unit: J/kg K. Relation: C' = m / c",
          "Unit: Calorie. Relation: C' = m + c"
        ],
        correctOptionIndex: 0,
        explanation: "Heat Capacity C' = Q / ΔT. SI unit is J/K (Joules per Kelvin). Relation: C' = m × c.",
        marks: 3
      },
      {
        questionText: "Q9(c) [4 Marks] 60 g of ice at 0°C is added to 140 g of water at 50°C (c_water = 4.2 J/g K, Latent heat of ice L = 336 J/g). Calculate the final temperature T of the mixture when all ice melts.",
        options: [
          "11.34°C (approx 11.3°C)",
          "25.0°C",
          "0°C",
          "35.5°C"
        ],
        correctOptionIndex: 0,
        explanation: "Heat gained by ice = (60 × 336) + (60 × 4.2 × T) = 20,160 + 252 T. Heat lost by water = 140 × 4.2 × (50 - T) = 29,400 - 588 T. Equating: 20160 + 252 T = 29400 - 588 T => 840 T = 9240 => T = 11°C.",
        marks: 4
      },
      {
        questionText: "MCQ [1 Mark] Specific latent heat of fusion of a substance depends on:",
        options: [
          "Nature of the substance",
          "Mass of the substance",
          "Temperature rise",
          "Volume of container"
        ],
        correctOptionIndex: 0,
        explanation: "Specific latent heat (L = Q / m) is a characteristic intrinsic property of the substance during state change.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Specific heat capacity of substance X is 400 J kg⁻¹ K⁻¹. This means:",
        options: [
          "400 J of heat energy is required to raise the temperature of 1 kg of X by 1 K",
          "400 J of heat is stored inside 1 kg of X",
          "1 J of heat raises temperature of 400 kg by 1 K",
          "400 J of heat melts 1 kg of X"
        ],
        correctOptionIndex: 0,
        explanation: "Specific heat capacity is defined as amount of heat required to raise temperature of unit mass (1 kg) by 1 K (or 1°C).",
        marks: 1
      },
      {
        questionText: "Q9(i) [3 Marks] Calculate heat energy required to melt 200 g of ice at 0°C and raise the temperature of resulting water to 100°C (L_ice = 336 J/g, c_w = 4.2 J/g K).",
        options: [
          "151,200 J (151.2 kJ)",
          "67,200 J",
          "84,000 J",
          "200,000 J"
        ],
        correctOptionIndex: 0,
        explanation: "Q1 (melting) = m L = 200 × 336 = 67,200 J. Q2 (heating) = m c ΔT = 200 × 4.2 × 100 = 84,000 J. Total Q = 67,200 + 84,000 = 151,200 J.",
        marks: 3
      },
      {
        questionText: "Q9(ii) [3 Marks] State the Principle of Calorimetry, name the material used to make a calorimeter, and give one characteristic property of this material.",
        options: [
          "Principle: Heat lost by hot body = Heat gained by cold body (in isolated system). Material: Copper. Property: Low specific heat capacity & high thermal conductivity",
          "Principle: Heat is created when mixing bodies. Material: Wood. Property: High specific heat capacity",
          "Principle: Temperature remains constant during heating. Material: Iron. Property: High density",
          "Principle: Heat flows from cold to hot body. Material: Glass. Property: Low density"
        ],
        correctOptionIndex: 0,
        explanation: "Principle of Conservation of Energy in thermal systems: Heat Lost = Heat Gained. Copper is used because of its low specific heat capacity and high thermal conductivity.",
        marks: 3
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Electricity & Electrical Circuits",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Ohm's Law, Equivalent Resistance, Fuse, MCB, Transformers & Appliance Ratings.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Electricity & Electrical Circuits",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q3(e) [2 Marks] Why is a copper wire NOT advisable as a fuse wire in household circuits?",
        options: [
          "Copper has a high melting point (1085°C) and low resistivity, so it will not melt during excess current, risking appliance damage / fire",
          "Copper has low melting point and high resistance",
          "Copper reacts with oxygen",
          "Copper does not conduct electricity"
        ],
        correctOptionIndex: 0,
        explanation: "Fuse wire must have low melting point (~218°C) and high resistance. Copper's high melting point prevents it from melting when dangerous current flows.",
        marks: 2
      },
      {
        questionText: "Q4(a) [2 Marks] Calculate total equivalent resistance across terminals AB for two 6 Ω resistors in parallel connected in series with a 3 Ω resistor.",
        options: [
          "6 Ω",
          "15 Ω",
          "3 Ω",
          "9 Ω"
        ],
        correctOptionIndex: 0,
        explanation: "Parallel combination R_p = (6 × 6)/(6 + 6) = 3 Ω. Total resistance R = R_p + 3 Ω = 3 + 3 = 6 Ω.",
        marks: 2
      },
      {
        questionText: "Q8(a) [3 Marks] Transformer: state core material and roles of primary and secondary coils.",
        options: [
          "Core Material: Soft Iron (laminated). Primary coil receives AC input; Secondary coil delivers AC output",
          "Core Material: Copper. Primary coil delivers DC output",
          "Core Material: Steel. Works on DC battery",
          "Core Material: Aluminum. Increases voltage always"
        ],
        correctOptionIndex: 0,
        explanation: "Soft iron core enhances magnetic flux linkage while lamination reduces eddy current losses. Primary receives AC voltage; secondary produces stepped up/down AC voltage.",
        marks: 3
      },
      {
        questionText: "Q8(b) [3 Marks] Define superconductors; calculate current drawn by a 110 W, 220 V appliance; name a substance whose resistance decreases with temperature.",
        options: [
          "Superconductor: Substance with zero electrical resistance below critical temperature. Current I = P/V = 110/220 = 0.5 A. Substance: Silicon / Germanium (Semiconductors)",
          "Superconductor: Insulator at room temperature. Current = 2 A. Substance: Copper",
          "Superconductor: High resistance material. Current = 1 A. Substance: Iron",
          "Superconductor: Perfect conductor at 100°C. Current = 0.25 A. Substance: Silver"
        ],
        correctOptionIndex: 0,
        explanation: "Superconductors offer zero resistance below T_c. Current I = P/V = 110/220 = 0.5 A. Semiconductors (Si, Ge, Carbon) have negative temperature coefficient of resistance.",
        marks: 3
      },
      {
        questionText: "Q8(c) [4 Marks] Three resistors 2 Ω, 3 Ω, 6 Ω in parallel connected across a 6 V battery with internal resistance r = 0.5 Ω: calculate main current I and terminal voltage V.",
        options: [
          "Parallel R_p = 1 Ω. Total R = 1.5 Ω. Main current I = 6 / 1.5 = 4 A. Terminal Voltage V = I × R_p = 4 × 1 = 4 V",
          "I = 2 A, V = 6 V",
          "I = 6 A, V = 3 V",
          "I = 1 A, V = 5 V"
        ],
        correctOptionIndex: 0,
        explanation: "1/R_p = 1/2 + 1/3 + 1/6 = 1 => R_p = 1 Ω. Total circuit resistance = 1 + 0.5 = 1.5 Ω. Main current I = E / (R_p + r) = 6 / 1.5 = 4 A. V = I × R_p = 4 × 1 = 4 V.",
        marks: 4
      },
      {
        questionText: "MCQ [1 Mark] Electrical energy consumed when current I flows through resistance R for time t is given by:",
        options: [
          "I² R t",
          "I R² t",
          "I R t",
          "I² R / t"
        ],
        correctOptionIndex: 0,
        explanation: "Joule's Law of Heating: Energy H = Power × time = (I² R) t.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Correct relation between e.m.f. (E), terminal voltage (V), current (I) and internal resistance (r) during discharge of a cell:",
        options: [
          "V = E - I r",
          "V = E + I r",
          "E = V - I r",
          "V = I r / E"
        ],
        correctOptionIndex: 0,
        explanation: "Terminal voltage V across cell terminals during current drawing is less than e.m.f. E by internal resistance voltage drop Ir: V = E - Ir.",
        marks: 1
      },
      {
        questionText: "Q2(vii) [2 Marks] Explain the meaning of geyser power rating '2000 W, 220 V'.",
        options: [
          "When connected to a 220 V supply, it consumes 2000 Joules of electrical energy per second",
          "It operates safely only at 2000 V",
          "It produces 220 Joules of heat per hour",
          "Current drawn is 2000 A"
        ],
        correctOptionIndex: 0,
        explanation: "Power rating 2000 W at 220 V indicates standard operating voltage (220 V) and energy consumption rate (2000 J/s = 2000 W).",
        marks: 2
      },
      {
        questionText: "Q3(ii) [2 Marks] Which safety component protects electrical circuits from excess current and can also be used as a switch; name the wire in which it is connected.",
        options: [
          "Miniature Circuit Breaker (MCB); connected in Live wire",
          "Fuse wire; connected in Neutral wire",
          "Transformer; connected in Earth wire",
          "Rheostat; connected in Live wire"
        ],
        correctOptionIndex: 0,
        explanation: "MCBs trip automatically under overload/short circuit and can be reset manually. Switches/protective devices are always placed in the Live wire.",
        marks: 2
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Magnetism & Electromagnetism",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Magnetic Field of Solenoids, Fleming's Rules, DC Motor & Electromagnetic Induction.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Magnetism & Electromagnetism",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q4(e) [2 Marks] A current-carrying circular loop carries clockwise current when viewed from front: identify the magnetic polarity facing us and state one way to increase magnetic field strength.",
        options: [
          "Polarity: South Pole (S-pole); Increase magnetic field by increasing current or number of turns in loop",
          "Polarity: North Pole (N-pole); Decrease current",
          "Polarity: East Pole; Use brass core",
          "Polarity: Neutral; Increase loop diameter"
        ],
        correctOptionIndex: 0,
        explanation: "Clock face rule: Clockwise current indicates South magnetic polarity. Magnetic field B ∝ I and B ∝ N (number of turns).",
        marks: 2
      },
      {
        questionText: "Q10(a) [3 Marks] State the energy transformation in a D.C. Motor, name the component that reverses current in armature coil, and give one practical application.",
        options: [
          "Transforms Electrical energy into Mechanical energy. Uses Split-ring commutator to reverse current every half rotation. Used in electric fans / water pumps",
          "Transforms Mechanical into Electrical energy. Uses slip rings",
          "Transforms Chemical into Electrical energy",
          "Transforms Heat into Light energy"
        ],
        correctOptionIndex: 0,
        explanation: "DC Motor converts electrical energy to mechanical rotational energy. Split rings (commutator) reverse current direction in coil every 180° to maintain continuous rotation.",
        marks: 3
      },
      {
        questionText: "MCQ [1 Mark] Which nuclear radiation suffers MAXIMUM deflection in a magnetic field?",
        options: [
          "Beta particles (β)",
          "Alpha particles (α)",
          "Gamma rays (γ)",
          "Neutrons"
        ],
        correctOptionIndex: 0,
        explanation: "Beta particles (electrons) have much smaller mass than alpha particles (m_alpha ≈ 7300 m_beta), hence undergo much greater deflection in magnetic fields.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] If electric current through a solenoid is increased, how does the magnetic field strength inside the solenoid change?",
        options: [
          "Increases linearly (B ∝ I)",
          "Decreases",
          "Remains unchanged",
          "Becomes zero"
        ],
        correctOptionIndex: 0,
        explanation: "Magnetic field inside solenoid B = μ_0 n I, which is directly proportional to current I.",
        marks: 1
      },
      {
        questionText: "Q3(iii) [2 Marks] A current-carrying conductor in a magnetic field experiences an upward force: name the rule used to determine the direction of this force.",
        options: [
          "Fleming's Left-Hand Rule",
          "Fleming's Right-Hand Rule",
          "Right-Hand Thumb Rule",
          "Faraday's Law"
        ],
        correctOptionIndex: 0,
        explanation: "Fleming's Left-Hand Rule determines the direction of magnetic force on a current-carrying conductor (Thumb: Force, Forefinger: Magnetic Field, Middle finger: Current).",
        marks: 2
      }
    ]
  },
  {
    title: "ICSE Class 10 Physics: Nuclear Physics & Radioactivity",
    description: "Previous Year ICSE Class 10 Board Exam Questions on Alpha, Beta & Gamma Rays, Nuclear Fission/Fusion, Safety Precautions & Background Radiation.",
    board: "ICSE",
    className: "Class 10",
    subject: "Physics",
    folderName: "Nuclear Physics & Radioactivity",
    examType: "previous-year",
    durationMinutes: 45,
    date: new Date().toISOString().split('T')[0],
    questions: [
      {
        questionText: "Q4(d) [2 Marks] A radioactive nucleus _Z^A X emits one alpha particle followed by one beta particle to form nucleus Y. Determine final atomic number Z' and mass number A'.",
        options: [
          "Atomic Number Z' = Z - 1, Mass Number A' = A - 4",
          "Z' = Z - 2, A' = A - 4",
          "Z' = Z + 1, A' = A",
          "Z' = Z - 3, A' = A - 2"
        ],
        correctOptionIndex: 0,
        explanation: "Alpha emission (_2^4 He): Z -> Z-2, A -> A-4. Beta emission (_-1^0 e): Z-2 -> Z-2+1 = Z-1, A-4 -> A-4. Final nucleus has atomic number Z - 1 and mass number A - 4.",
        marks: 2
      },
      {
        questionText: "Q10(b) [3 Marks] Differentiate Nuclear Fission and Nuclear Fusion; give one safety precaution for disposing radioactive waste.",
        options: [
          "Fission: Heavy nucleus splits into lighter nuclei. Fusion: Light nuclei combine into heavy nucleus at high temp. Precaution: Store waste in thick lead/concrete containers deep underground",
          "Fission combines nuclei; Fusion splits nuclei. Precaution: Dump waste in rivers",
          "Both require low temperature. Precaution: Store in plastic bags",
          "Fission produces no energy; Fusion produces electricity directly"
        ],
        correctOptionIndex: 0,
        explanation: "Nuclear fission splits heavy nucleus (e.g. U-235). Nuclear fusion fuses light nuclei (e.g. H isotopes) under extreme heat. Radioactive waste must be sealed in lead-lined casks buried in geological repositories.",
        marks: 3
      },
      {
        questionText: "Q10(c) [4 Marks] Nucleus A with 84 protons and 128 neutrons (A = 212) emits an alpha particle to form B, which then emits a beta particle to form C: find proton/neutron composition of B and C, and state effect of subsequent gamma emission.",
        options: [
          "B: 82 protons, 126 neutrons; C: 83 protons, 125 neutrons. Gamma emission causes NO change in atomic or mass number (only energy state drops)",
          "B: 84 p, 128 n; C: 85 p, 127 n. Gamma reduces mass number by 1",
          "B: 80 p, 124 n; C: 81 p, 123 n. Gamma converts proton to neutron",
          "B: 82 p, 128 n; C: 83 p, 128 n. Gamma increases atomic number"
        ],
        correctOptionIndex: 0,
        explanation: "A: Z=84, A=212. Alpha decay -> B: Z=82, A=208 (82 p, 126 n). Beta decay -> C: Z=83, A=208 (83 p, 125 n). Gamma emission is photon radiation (0 charge, 0 mass), so Z and A remain unchanged.",
        marks: 4
      },
      {
        questionText: "Q3(v) [2 Marks] What is the effect of a chemical reaction or extreme temperature change on the radioactivity of a radioisotope? Give a reason.",
        options: [
          "No effect (Radioactivity is a purely nuclear phenomenon originating inside the nucleus, unaffected by orbital electrons or chemical bonding)",
          "Radioactivity stops completely during chemical reaction",
          "Radioactivity doubles when heated",
          "Radioactivity depends on electron valency"
        ],
        correctOptionIndex: 0,
        explanation: "Radioactive decay involves intranuclear forces within the atomic nucleus. Chemical reactions and heating affect only outermost orbital electrons.",
        marks: 2
      },
      {
        questionText: "MCQ [1 Mark] Which type of nuclear radiation travels completely UNDEVIATED when passing through an electric field?",
        options: [
          "Gamma radiation (γ)",
          "Alpha particles (α)",
          "Beta particles (β)",
          "Cathode rays"
        ],
        correctOptionIndex: 0,
        explanation: "Gamma rays are neutral electromagnetic photons (charge = 0), so electric and magnetic fields exert zero force on them.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] How can escaping nuclear radiation (gamma rays and neutrons) from a nuclear reactor be stopped?",
        options: [
          "Thick lead shielding and heavy concrete walls",
          "Thin sheet of paper",
          "Aluminum foil",
          "Wooden door"
        ],
        correctOptionIndex: 0,
        explanation: "High penetrating power of gamma rays and neutrons requires high-density material like lead blocks and thick reinforced concrete containment walls.",
        marks: 1
      },
      {
        questionText: "MCQ [1 Mark] Name one internal source of background radiation in the human body:",
        options: [
          "Potassium-40 (K-40) / Carbon-14 (C-14) present inside body tissues",
          "Cosmic rays from deep space",
          "Radon gas in atmosphere",
          "Medical X-ray machines"
        ],
        correctOptionIndex: 0,
        explanation: "Radioisotopes naturally incorporated in biological cells and bones (such as K-40 and C-14) act as internal background radiation sources.",
        marks: 1
      },
      {
        questionText: "Q7(ii) [3 Marks] Which nuclear radiation possesses the HIGHEST ionizing power?",
        options: [
          "Alpha radiation (α)",
          "Beta radiation (β)",
          "Gamma radiation (γ)",
          "X-rays"
        ],
        correctOptionIndex: 0,
        explanation: "Alpha particles have large mass and +2e charge, giving them maximum charge density to knock electrons from gas molecules (~100x beta, ~10,000x gamma).",
        marks: 3
      },
      {
        questionText: "Q2(i)(a) [1 Mark] When does the nucleus of an atom tend to become radioactive and unstable?",
        options: [
          "When neutron-to-proton ratio (N/Z) becomes too large or when atomic number Z > 82",
          "When it gains a valence electron",
          "When temperature drops to 0 K",
          "When it forms a covalent bond"
        ],
        correctOptionIndex: 0,
        explanation: "Nuclei with high N/Z ratio or heavy elements with Z > 82 (beyond Lead) have unstable binding energy per nucleon and undergo spontaneous decay.",
        marks: 1
      }
    ]
  }
];

async function seedICSEPYQ() {
  console.log('🚀 Starting ICSE Class 10 Physics PYQ Seeding to MongoDB...');
  console.log(`URI: ${MONGODB_URI}`);
  console.log(`Database: ${DB_NAME}`);

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Delete existing exams for these specific folders to prevent duplicates
    const folderNames = pyqExams.map(e => e.folderName);
    const deleteRes = await db.collection('practice_exams').deleteMany({
      board: 'ICSE',
      className: 'Class 10',
      subject: 'Physics',
      examType: 'previous-year',
      folderName: { $in: folderNames }
    });
    console.log(`Cleaned up ${deleteRes.deletedCount} existing ICSE Class 10 Physics PYQ exam(s).`);

    const examsToInsert = pyqExams.map(ex => ({
      ...ex,
      createdBy: new ObjectId('507f1f77bcf86cd799439011'), // System / Admin ID
      createdAt: new Date()
    }));

    const result = await db.collection('practice_exams').insertMany(examsToInsert);
    console.log(`✅ Successfully seeded ${result.insertedCount} ICSE Class 10 Physics PYQ exam paper(s) into database!`);
    
    // Print summary
    pyqExams.forEach((ex, i) => {
      console.log(`   ${i + 1}. [${ex.folderName}] - ${ex.questions.length} questions`);
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seedICSEPYQ();
