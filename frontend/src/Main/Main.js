import react from 'react';
import "./style.css"
//import Navbar from '../Navigation/NavbarMain'
import Service from './components/service/service';
import ImageTextSection from './components/ImageTextSection/ImageTextSection';

export default function Main() {
    return (
        <div className="page-container">
            <div className="headerWrapper relative h-full w-full">
                <div className="rowHeader headerImage inline-block h-full w-full relative bg-cover bg-center bg-no-repeat">
                    <div className="backgroundOverlayHeader bg-black bg-opacity-70 h-full absolute top-0 left-0 right-0 bottom-0"></div>
                    
                    <div className="bottomHeaderInfo w-1/2 m-auto relative">
                    <div className="antonFont text-white text-center">
                        <div className="text-[30px] sm:text-[40px] md:text-[60px] relative bottomHeaderInfo w-full">
                        NO PAIN NO GAIN
                        </div>
                        <p className="openSansFont text-[17px]">
                        Having a perfect body requires a lot of training. Believe in yourself
                        and all that you are. Know that there is something inside you that is
                        greater than any obstacle.
                        </p>
                    </div>
                    <div className="getStartedDiv">
                        <div className="getStartedBtn font-bold border-0 w-1/5 text-center m-auto mt-7 rounded-md text-white bg-red-600 py-4 cursor-pointer hover:bg-yellow-400 hover:text-black duration-150 ease-out hover:ease-in">
                        GET STARTED
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <div id="services" className='newSubMainSection bg-slate-900 h-auto pb-32'> {/* h-[40rem]  */}
                <div className='infoSection px-10 pt-28'>
                    <div className='text-center'>
                        <div className='subMainSectionTitle mb-5 text-white fontPoppins text-2xl'>
                            What We Offer
                        </div>
                        <hr className='sectionSeperator w-[50px] m-auto border-t-2 border-red-500'></hr>
                    </div>
                    <div className='infoSectionTitles mt-28 grid sm:grid-cols-2 xl:grid-cols-4 gap-6'>
                        <ImageTextSection 
                            imageClass='imgDietLogging'
                            title='Diet Tracking'
                        />
                        <ImageTextSection 
                            imageClass='imgLogging'
                            title='Exercise Logging'
                        />
                        <ImageTextSection 
                            imageClass='imgPersonalTrainig'
                            title='Personal Program'
                        />
                        <ImageTextSection 
                            imageClass='imgOpenTwentyFourSeven'
                            title='24/7 Chat Available'
                        />
                    </div>
                </div>

            </div>
            <div className='bg-slate-300 border-t-[3px] inline-block pb-32'>
                <div className='infoSection w-3/4 m-auto pt-28'>
                    <div className='text-center'>
                        <div className='subMainSectionTitle mb-5 text-black fontPoppins text-2xl'>
                            Why Us?
                        </div>
                        <hr className='sectionSeperator w-[50px] m-auto border-t-2 border-red-500'></hr>
                    </div>
                </div>
                <div className='px-10 SubMainSectionHeaderPart1 grid md:grid-cols-2 mt-28'>
                    <div className='subMainSectionHeadera'>
                        {/* <div className='font-bold'>Title</div> */}
                        <div className=''>
                            <Service 
                            iconClass = 'iconAvailability'
                            title = '24/7 Availability'
                            description = 'Choose our 24/7 fitness app for an unparalleled fitness experience that will empower you to become the best version of yourself. Discover the difference today and join our thriving community!'
                            />
                            <Service 
                            iconClass = 'firstTitleIcon'
                            title = 'Certified and Experienced Trainers'
                            description = 'Our team of certified trainers is dedicated to helping you reach your fitness goals. With years of experience in the industry, they have the knowledge and expertise to guide you through your workouts and provide support every step of the way. Their passion for fitness and commitment to your success makes our fitness center the perfect place to transform your body and mind.'
                            />
                            <Service 
                            iconClass = 'iconTrainingProgram'
                            title = '24/7 Availability'
                            description = "Whether you're a beginner, intermediate, or advanced athlete, we design personalized workout plans tailored to your unique fitness level and goals. Our programs ensure you make consistent progress and stay motivated throughout your journey."
                            />
                            <Service 
                            iconClass = 'iconTwentyFourSeven'
                            title = 'Track Your Progress'
                            description = "Keep track of your fitness journey with our app's built-in tracking features. Monitor your workouts, nutrition, and overall progress, ensuring you stay motivated and informed about your performance."
                            />
                        </div>
                    </div>
                    <div className='subMainSectionHeader h-3/4 subMainSectionHeaderRight mt-10 sm:mt-0'>
                        <div className='imgSubHeaderInfo'></div>
                    </div>
                </div>
                {/* <div className='reviewSection SubMainSectionHeaderPart2 my-10 clearfix px-10'>
                    <div className='Icon iconGen iconHeight45PartReview w-1/6 float-left'>&#160;</div>
                    <div className='reviewData w-5/6 float-right'>
                        <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived</div>
                    </div>
                </div> */}
            </div>
            <div className='footer contactSection relative bg-sky-500 pt-10 pb-2 border-t-[3px] openSansFont'>
                <div className='grid sm:grid-cols-2 px-10'>
                    <div id="contactus" className='contactForm px-0 sm:px-4 border-r-0 sm:border-r-2 order-2 sm:order-1'>
                        <div className='divForm mt-10 sm:mt-0'>
                            <form>
                                <h4 className='text-center font-bold mb-4'>Contact Us For Anything!</h4>
                                <div className='field grid gap-2 md:grid-cols-2 sm:grid-cols sm:gap-1 mb-2 sm:mb-0'>
                                    <div className='w-full'><input className='w-full' placeholder='First Name'/></div>
                                    <div className='w-full'><input className='w-full' placeholder='Last Name'/></div>
                                </div>
                                <div className='field mt-1 sm:mb-1 mb-2 grid gap-2 md:grid-cols-2 sm:grid-cols sm:gap-1'>
                                    <div className='w-full'><input className='w-full' placeholder='Country'/></div>
                                    <div className='w-full'><input className='w-full' placeholder='Title'/></div>
                                </div>
                                <div className='field flex mb-4 space-x-4 h-24'>
                                    <div className='w-full h-full'><textarea className='w-full h-full px-2' placeholder='Note'/></div>
                                </div>
                                <div className='submitBtn text-center my-2'>
                                    <input type="submit" placeholder='SUBMIT' className='rounded-lg font-bold bg-emerald-400 text-zinc-200 px-9 py-1 w-full hover:bg-white hover:border-emerald-400 hover:text-emerald-400'/>
                                </div>
                            </form>

                        </div>
                    </div>
                    <div className='addressDiv pl-0 sm:pl-4 order-1 sm:order-2'>
                        <div className='h-full flex flex-col justify-around'>
                            <div className='rowAddress mt-[10px] flex'>
                                <div className='w-1/6'>
                                    <div className='iconPhone iconGen iconAddress w-full float-left '>&#160;</div>
                                </div>
                                <div className='w-5/6'>
                                    <div className='font-bold'>Phone:</div>
                                    <div className=''>(972+) 547 321 012</div>
                                </div>
                            </div>
                            <div className='rowAddress mt-[10px] flex '>
                                <div className='w-1/6'>
                                    <div className='iconAddress iconGen iconAddress w-full float-left '>&#160;</div>
                                </div>
                                <div className='w-5/6'>
                                    <div className='font-bold'>Address:</div>
                                    <div className=''>112 Igal Alon st., Space Tower 4, Fl. 15, Tel Aviv, 67878911, Israel</div>
                                </div>
                            </div>
                            <div className='rowAddress mt-[10px] flex'>
                                <div className='w-1/6'>
                                    <div className='iconEmail iconGen iconAddress w-full float-left'>&#160;</div>
                                </div>
                                <div className='w-5/6'>
                                    <div className='font-bold'>Email:</div>
                                    <div className=''>FitnessWeb@gmail.com</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
}