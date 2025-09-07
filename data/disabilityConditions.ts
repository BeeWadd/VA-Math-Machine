import { DisabilityCondition } from '../types';

export const disabilityConditions: DisabilityCondition[] = [
  // Mental Health
  { name: 'Post-Traumatic Stress Disorder (PTSD)', ratings: [0, 10, 30, 50, 70, 100], description: 'Mental condition from a traumatic event' },
  { name: 'Major Depressive Disorder', ratings: [0, 10, 30, 50, 70, 100], description: 'Persistent low mood and loss of interest' },
  { name: 'Generalized Anxiety Disorder', ratings: [0, 10, 30, 50, 70, 100], description: 'Excessive, uncontrollable worry' },
  { name: 'Somatic Symptom Disorder', ratings: [0, 10, 30, 50, 70, 100], description: 'Focus on physical symptoms causing distress' },
  { name: 'Adjustment Disorder', ratings: [0, 10, 30, 50, 70, 100], description: 'Emotional/behavioral reaction to stress' },
  { name: 'Bipolar Disorder', ratings: [0, 10, 30, 50, 70, 100], description: 'Extreme mood swings (mania and depression)' },

  // Musculoskeletal
  { name: 'Lumbosacral or Cervical Strain (Back/Neck Pain)', ratings: [10, 20, 30, 40, 50, 60, 100], description: 'Pain/stiffness in the lower back or neck' },
  { name: 'Degenerative Arthritis', ratings: [10, 20], canBeBilateral: true, description: 'Joint pain from cartilage breakdown' },
  { name: 'Intervertebral Disc Syndrome (IVDS)', ratings: [10, 20, 30, 40, 50, 60, 100], description: 'Back pain from damaged spinal discs' },
  { name: 'Rheumatoid Arthritis', ratings: [10, 20, 40, 60, 100], description: 'Autoimmune joint inflammation' },
  { name: 'Limitation of Motion of the Hip', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Reduced range of motion in the hip joint' },
  { name: 'Limitation of Flexion of the Knee', ratings: [0, 10, 20, 30], canBeBilateral: true, description: 'Difficulty bending the knee' },
  { name: 'Limitation of Motion of the Ankle', ratings: [10, 20], canBeBilateral: true, description: 'Reduced range of motion in the ankle' },
  { name: 'Limitation of Motion of the Shoulder', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Difficulty moving the shoulder joint' },
  { name: 'Limitation of Motion of the Elbow', ratings: [0, 10, 20, 30, 40, 50], canBeBilateral: true, description: 'Difficulty bending or straightening the elbow' },
  { name: 'Limitation of Motion of the Wrist', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Reduced range of motion in the wrist' },
  { name: 'Plantar Fasciitis', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Heel pain, especially in the morning' },
  { name: 'Flatfoot (Pes Planus)', ratings: [0, 10, 20, 30, 50], canBeBilateral: true, description: 'Fallen arches in the feet' },
  { name: 'Amputation below the knee', ratings: [40, 60], canBeBilateral: true, description: 'Surgical removal of leg below the knee' },
  { name: 'Amputation above the knee', ratings: [60, 80, 90], canBeBilateral: true, description: 'Surgical removal of leg above the knee' },
  
  // Neurological
  { name: 'Migraine headaches', ratings: [0, 10, 30, 50], description: 'Severe, recurring headaches with other symptoms' },
  { name: 'Sciatic Nerve Paralysis (Sciatica)', ratings: [10, 20, 40, 60, 80], canBeBilateral: true, description: 'Pain radiating along the sciatic nerve' },
  { name: 'Peripheral Neuropathy', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Nerve damage causing weakness, numbness, pain' },
  { name: 'Radiculopathy (Cervical/Lumbar)', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Pinched nerve in the spine' },
  { name: 'Traumatic Brain Injury (TBI)', ratings: [0, 10, 40, 70, 100], description: 'Brain dysfunction caused by an external force' },
  { name: 'Fibromyalgia', ratings: [10, 20, 40], description: 'Widespread musculoskeletal pain and fatigue' },
  { name: 'Multiple Sclerosis (MS)', ratings: [30, 60, 100], description: 'Nerve damage disrupting brain-body communication' },
  { name: 'Parkinson\'s Disease', ratings: [30, 100], description: 'Nervous system disorder affecting movement' },

  // Special Senses (Auditory & Visual)
  { name: 'Tinnitus', ratings: [10], description: 'Ringing or buzzing in the ears' },
  { name: 'Hearing Loss', ratings: [0, 10], canBeBilateral: true, description: 'Reduced ability to hear sounds' },
  { name: 'Glaucoma', ratings: [10, 20, 40, 60], canBeBilateral: true, description: 'Eye condition damaging the optic nerve' },
  { name: 'Cataracts, traumatic', ratings: [10, 20, 30, 40, 60], canBeBilateral: true, description: 'Clouding of the eye lens due to injury' },
  { name: 'Blurry Vision (Loss of Visual Acuity)', ratings: [10, 20, 30, 40], canBeBilateral: true, description: 'Lack of sharpness in vision' },

  // Respiratory
  { name: 'Sleep Apnea', ratings: [0, 30, 50, 100], description: 'Breathing repeatedly stops and starts during sleep' },
  { name: 'Asthma', ratings: [10, 30, 60, 100], description: 'Airways narrow, swell, and produce extra mucus' },
  { name: 'Chronic Bronchitis', ratings: [10, 30, 60, 100], description: 'Inflammation of the bronchial tubes' },
  { name: 'Chronic Sinusitis', ratings: [0, 10, 30, 50], description: 'Long-term inflammation of the sinuses' },
  { name: 'Allergic Rhinitis', ratings: [10, 30], description: 'Hay fever; nasal inflammation from allergens' },

  // Cardiovascular
  { name: 'Hypertension (High Blood Pressure)', ratings: [10, 20, 40, 60], description: 'Force of blood against artery walls is too high' },
  { name: 'Coronary Artery Disease (CAD)', ratings: [10, 30, 60, 100], description: 'Narrowing of arteries supplying blood to the heart' },
  { name: 'Ischemic Heart Disease', ratings: [10, 30, 60, 100], description: 'Heart problems caused by narrowed arteries' },
  
  // Gastrointestinal
  { name: 'Gastroesophageal Reflux Disease (GERD)', ratings: [10, 30, 60], description: 'Stomach acid frequently flows back into the esophagus' },
  { name: 'Irritable Bowel Syndrome (IBS)', ratings: [0, 10, 30], description: 'Intestinal disorder causing pain, gas, diarrhea, constipation' },
  { name: 'Ulcerative Colitis', ratings: [10, 30, 60, 100], description: 'Inflammatory bowel disease causing ulcers in digestive tract' },
  { name: 'Crohn\'s Disease', ratings: [10, 30, 60, 100], description: 'Inflammatory bowel disease affecting digestive tract lining' },
  { name: 'Hemorrhoids', ratings: [0, 10, 20], description: 'Swollen veins in the anus and lower rectum' },

  // Endocrine
  { name: 'Diabetes Mellitus (Type II)', ratings: [10, 20, 40, 60, 100], description: 'Body doesn\'t use insulin properly' },
  { name: 'Thyroid Conditions (Hyper/Hypo)', ratings: [10, 30, 60, 100], description: 'Overactive or underactive thyroid gland' },

  // Genitourinary
  { name: 'Erectile Dysfunction (ED)', ratings: [0], description: 'Inability to get or keep an erection' },
  { name: 'Kidney Disease (Nephritis)', ratings: [0, 30, 60, 80, 100], description: 'Inflammation of the kidneys' },
  { name: 'Bladder Conditions (e.g., incontinence)', ratings: [10, 20, 40, 60], description: 'Issues with bladder control' },
  
  // Dermatological
  { name: 'Dermatitis or Eczema', ratings: [0, 10, 30, 60], description: 'Skin inflammation causing itchiness and rashes' },
  { name: 'Psoriasis', ratings: [0, 10, 30, 60], description: 'Skin cells build up and form itchy, dry patches' },
  { name: 'Scars (painful or unstable)', ratings: [10, 20, 30, 40, 50], description: 'Painful, unstable, or disfiguring scars' },
];