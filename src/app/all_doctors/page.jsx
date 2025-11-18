// import React from 'react'
// import All_Doctor from './Components/All_Doctor'

// export default function page() {

//   return (
//     <div className='mt-28'>
//       <section>
//         <div className='bg-amber-200 px-8 py-8 flex justify-center'>
//           All Doctor image
//         </div>
//         <div>
//           <All_Doctor></All_Doctor>
//         </div>
//       </section>
//     </div>
//   )
// }





import dbconnect, { collectionNameObj } from '@/lib/dbconnect'
import DoctorDirectory from './Components/All_Doctor';


export default async function All_Doctor() {
  const Doctors = dbconnect(collectionNameObj.All_Doctor_Collection);
  let data = await Doctors.find({}).toArray();
  data = data.map(d => ({
    ...d,
    _id: d._id.toString(),
    Consultation_Fee: Number(d.Consultation_Fee) || 0,
    yearsOfExperience: Number(d.yearsOfExperience) || 0,
    ratings: Number(d.ratings) || 0,
  }));

  return (
    <div className='mt-28'><DoctorDirectory  doctors={data}/> </div>
)
  
}
