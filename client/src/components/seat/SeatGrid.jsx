import React from 'react';

export const SeatGrid = ({
  seatCategories = [],
  pricing = { vip: 450, gold: 320, silver: 220 },
  bookedSeats = [],
  lockedSeats = [],
  selectedSeats = [],
  onToggleSeat,
}) => {
  const isSelected = (seatNo) => selectedSeats.some((s) => s.seatNumber === seatNo);
  const isBooked = (seatNo) => bookedSeats.includes(seatNo);
  const isLocked = (seatNo) => lockedSeats.includes(seatNo);

  const getPriceForCategory = (categoryName) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('vip') || cat.includes('recliner')) return pricing.vip || 450;
    if (cat.includes('gold')) return pricing.gold || 320;
    return pricing.silver || 220;
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
      {/* Curved Screen Element */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve" />
        <span className="cinema-screen-text">All Eyes This Way • Cinema Screen</span>
      </div>

      {/* Seat Layout Sections grouped by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', minWidth: '550px' }}>
        {seatCategories.map((category) => {
          const categoryPrice = getPriceForCategory(category.name);

          return (
            <div key={category.name} style={{ textAlign: 'center' }}>
              {/* Category Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', flexGrow: 1, maxWidth: '120px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {category.name} — <span style={{ color: '#fff' }}>₹{categoryPrice}</span>
                </span>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', flexGrow: 1, maxWidth: '120px' }} />
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                {category.rows.map((rowLetter) => {
                  return (
                    <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Row Label */}
                      <span
                        style={{
                          width: '24px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#64748b',
                          textAlign: 'right',
                        }}
                      >
                        {rowLetter}
                      </span>

                      {/* Seats in this row */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {Array.from({ length: category.seatsPerRow }, (_, i) => {
                          const seatNumber = `${rowLetter}${i + 1}`;
                          const booked = isBooked(seatNumber);
                          const locked = isLocked(seatNumber);
                          const selected = isSelected(seatNumber);

                          let seatClass = 'seat-available';
                          if (selected) seatClass = 'seat-selected';
                          else if (booked) seatClass = 'seat-booked';
                          else if (locked) seatClass = 'seat-locked';

                          // Aisle split in middle
                          const isMiddleAisle = i === Math.floor(category.seatsPerRow / 2);

                          return (
                            <React.Fragment key={seatNumber}>
                              {isMiddleAisle && <div style={{ width: '16px' }} />}
                              <button
                                type="button"
                                disabled={booked || locked}
                                onClick={() =>
                                  onToggleSeat({
                                    seatNumber,
                                    category: category.name,
                                    price: categoryPrice,
                                  })
                                }
                                className={`seat-item ${seatClass}`}
                                title={`${seatNumber} - ${category.name} (₹${categoryPrice})`}
                              >
                                {i + 1}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* End Row Label */}
                      <span
                        style={{
                          width: '24px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#64748b',
                          textAlign: 'left',
                        }}
                      >
                        {rowLetter}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

