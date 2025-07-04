import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ShopDetailContent from '../../components/ShopDetailContent/ShopDetailContent';
import ChatSection from '../../components/ChatSection/ChatSection';
import axios from '../../api/axios';

const ShopDetail = () => {
  const { shopId } = useParams();
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(`/store/stores/${shopId}`);
    
        // ⚠️ Map lại ownerId từ trường 'owner'
        const shopWithOwner = {
          ...res.data,
          ownerId: res.data.owner, // <= gán ownerId từ owner (vì ChatSection cần đúng key)
        };
    
        setShop(shopWithOwner);
        console.log('🔍 Shop loaded in ShopDetail:', shopWithOwner);
      } catch (err) {
        console.error('❌ Failed to fetch shop:', err);
      }
    };
    
  
    fetchShop();
  
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [shopId]);
  
  return (
    <div>
      {shop && <ShopDetailContent shopId={shopId} />}
      {shop && <ChatSection shopId={shopId} shop={shop} />}
    </div>
  );
};

export default ShopDetail;
