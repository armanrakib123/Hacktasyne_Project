import dbconnect, { collectionNameObj } from '@/lib/dbconnect'
import Link from 'next/link';
import React from 'react'

export default async function All_Doctor() {
  const Doctors = dbconnect(collectionNameObj.All_Doctor_Collection);
  let data = await Doctors.find({}).toArray();

  data = data.map(d => ({ ...d, _id: d._id.toString() }));

  return (
    <div className='grid grid-cols-12'>
      {data.map((item) => (
        <div className='lg:col-span-3 px-8 py-8' key={item._id}>
          <Link href={`/doctor_details/${item._id}`}>
            <div>

              {/* <div>
                <img
                  src={item.profilePicture}
                  alt="Doctor image"
                  width={314}
                  height={208}
                />
              </div>
              <div className='flex'>
                <h1>{item.title}</h1>
                <h2>{item.firstName}</h2>
              </div>
              <div>
                <h1>{item.specialty}</h1>
              </div>
              <div className='flex gap-24'>
                <h1 className='text-red-500 font-bold'>{item.price}</h1>
              </div> */}

              <div className="card bg-base-100 w-96 shadow-sm">
                <figure>
                  <img className='w-full h-56'
                    src={item.profilePicture}
                    alt="Doctor" />
                </figure>
                <div className="card-body">
                  <div className='flex justify-between '>
                    <div className='flex gap-1.5 text-2xl font-bold'>
                      <h1>{item.title}</h1>
                      <h1>{item.firstName}</h1>
                      <h1>{item.lastName}</h1>

                    </div>
                    <div className='mt-2 font-bold'>
                      {item.ratings}
                    </div>
                  </div>
                  <div>
                    <div>{item.qualifications[0]}</div>
                    <div>{item.specialty}</div>
                    <div>Working in <span className='font-bold'>{item.hospitalAffiliation}</span></div>
                    <div>Experience: {item.yearsOfExperience} Years</div>
                    <div>Consultetion Fee:<span className='font-bold'>{item.Consultation_Fee}</span></div>
                  </div>



                </div>
              </div>










            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
