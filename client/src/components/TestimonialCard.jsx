import { Star } from 'lucide-react';
import React from 'react'

const TestimonialCard = ({ testimonial }) => (
    <div className="min-w-[350px] bg-white shadow-md p-5 rounded-xl">
        <div className="flex items-center my-3 gap-3">
            <span className="text-5xl">{testimonial.image}</span>
            <div>
                <h2 className="text-xl font-semibold">{testimonial.name}</h2>
                <p className="text-gray-500">{testimonial.role}</p>
            </div>
        </div>

        <p className="text-gray-800">{testimonial.text}</p>

        <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={
                        star <= testimonial.rate
                            ? "w-5 h-5 text-yellow-500 fill-yellow-500"
                            : "w-5 h-5 text-gray-300"
                    }
                />
            ))}
        </div>
    </div>
);


export default TestimonialCard